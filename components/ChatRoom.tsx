'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase, Message, cleanupOldMessages, flagQuestionForRemoval } from '@/lib/supabase';
import { startQuiz, handleAnswerCheck, getQuizState, resetInactivityTimer, stopQuiz, restartQuiz } from '@/lib/quizBot';
import { checkAndHandleTimeout } from '@/lib/checkQuizTimeout';
import Leaderboard from './Leaderboard';
import OnlineUsers from './OnlineUsers';
import CategorySelector from './CategorySelector';

export default function ChatRoom({ username }: { username: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizRunning, setQuizRunning] = useState(false);
    const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showOnlineUsers, setShowOnlineUsers] = useState(false);
    const [onlineCount, setOnlineCount] = useState(0);
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Clean up old messages (older than 30 minutes) on app load
        cleanupOldMessages();

        // Check if quiz question timed out (in case all users left)
        checkAndHandleTimeout();

        loadMessages();
        const cleanupMessages = subscribeToMessages();

        // Load initial quiz state
        loadQuizState();

        // Subscribe to quiz state changes
        const cleanupQuiz = subscribeToQuizState();

        // Handle app visibility change (when app comes back from background)
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible') {
                console.log('App became visible - refreshing data');
                // Check if quiz question timed out while user was away
                await checkAndHandleTimeout();
                // Reload messages and quiz state when app becomes visible again
                loadMessages();
                loadQuizState();
                scrollToBottom();
            }
        };

        // Handle window focus (additional safeguard for iOS/mobile)
        const handleFocus = async () => {
            console.log('App gained focus - refreshing data');
            // Check if quiz question timed out while user was away
            await checkAndHandleTimeout();
            loadMessages();
            loadQuizState();
            scrollToBottom();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            cleanupMessages();
            cleanupQuiz();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Auto-stop quiz when no players are online
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (onlineCount === 0 && quizRunning) {
            // Wait 10 seconds before stopping (in case someone is refreshing)
            timeoutId = setTimeout(async () => {
                console.log('No players online - stopping quiz');
                await stopQuiz(false); // Don't send message since no one is there
            }, 10000); // 10 seconds delay
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [onlineCount, quizRunning]);

    const scrollToBottom = () => {
        // Use setTimeout to ensure content is rendered before scrolling
        setTimeout(() => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
            }
        }, 100);
    };

    const loadMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            // Reverse to show oldest first (chronological order)
            setMessages((data || []).reverse());
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const subscribeToMessages = () => {
        console.log('Setting up real-time subscription...');

        const channel = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                },
                (payload: any) => {
                    console.log('New message received!', payload);
                    setMessages((current: Message[]) => [...current, payload.new as Message]);
                }
            )
            .subscribe((status: string) => {
                console.log('Messages subscription status:', status);
            });

        return () => {
            console.log('Cleaning up messages subscription...');
            supabase.removeChannel(channel);
        };
    };

    const loadQuizState = async () => {
        const state = await getQuizState();
        if (state) {
            setQuizRunning(state.is_active);
            setCurrentQuestionId(state.current_question_id);
        }
    };

    const subscribeToQuizState = () => {
        console.log('Setting up quiz state subscription...');

        const channel = supabase
            .channel('public:quiz_state')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'quiz_state',
                },
                (payload: any) => {
                    console.log('Quiz state updated!', payload);
                    setQuizRunning(payload.new.is_active);
                    setCurrentQuestionId(payload.new.current_question_id);
                }
            )
            .subscribe((status: string) => {
                console.log('Quiz state subscription status:', status);
            });

        return () => {
            console.log('Cleaning up quiz state subscription...');
            supabase.removeChannel(channel);
        };
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageContent = newMessage.trim();

        // SECRET COMMAND: !restart - Restarts quiz without showing in chat
        if (messageContent === '!restart') {
            setNewMessage('');
            try {
                console.log('🔄 Secret restart command triggered by:', username);
                await restartQuiz();
                console.log('✅ Restart successful!');
            } catch (error) {
                console.error('Error restarting quiz:', error);
                alert('Greška pri restartovanju kviza');
            }
            return; // Don't send to chat
        }

        try {
            const { error } = await supabase.from('messages').insert({
                username: username,
                content: messageContent,
            });

            if (error) throw error;
            setNewMessage('');

            // If quiz is active, ANYONE can answer
            if (quizRunning) {
                // Reset inactivity timer on user message
                resetInactivityTimer();

                // Wait a bit for the message to be sent, then check answer
                setTimeout(() => {
                    handleAnswerCheck(messageContent, username);
                }, 500);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Greška pri slanju poruke');
        }
    };

    const handleStartQuiz = async (selectedCategories?: string[] | null) => {
        setQuizLoading(true);
        try {
            await startQuiz(selectedCategories);
            // quizRunning will be updated via real-time subscription
        } catch (error) {
            console.error('Error triggering quiz bot:', error);
            alert('Greška pri pokretanju kviza');
        } finally {
            setQuizLoading(false);
        }
    };

    const handleFlagQuestion = async (questionId: number) => {
        try {
            const success = await flagQuestionForRemoval(questionId);
            if (success) {
                // Add to flagged set for immediate UI feedback
                setFlaggedQuestions(prev => new Set(prev).add(questionId));
                console.log('✓ Pitanje je označeno za proveru!');
            } else {
                console.error('✗ Greška pri označavanju pitanja.');
            }
        } catch (error) {
            console.error('Error flagging question:', error);
        }
    };

    const handleRestartQuiz = async () => {
        setQuizLoading(true);
        try {
            await restartQuiz();
            // quizRunning will be updated via real-time subscription
        } catch (error) {
            console.error('Error restarting quiz:', error);
            alert('Greška pri restartovanju kviza');
        } finally {
            setQuizLoading(false);
        }
    };

    const handleChangeUsername = () => {
        localStorage.removeItem('chatUsername');
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-xl text-gray-600">Učitavanje...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-white shadow-md">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center gap-4">
                        {/* Left: Title & User */}
                        <div className="flex-shrink-0">
                            <h1 className="text-xl lg:text-2xl font-bold text-gray-800">🎯 Kosingasi Kviz</h1>
                            <p className="text-xs lg:text-sm text-gray-600">Korisnik: {username}</p>
                        </div>

                        {/* Right: Action Buttons */}
                        <div className="flex gap-2 flex-wrap justify-end">
                            {/* Category Selector & Quiz Control */}
                            <CategorySelector 
                                onStartQuiz={handleStartQuiz}
                                disabled={quizLoading || quizRunning}
                            />

                            {/* Restart Quiz Button - Only show when quiz is running */}
                            {quizRunning && (
                                <button
                                    onClick={handleRestartQuiz}
                                    disabled={quizLoading}
                                    className="px-3 lg:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                >
                                    {quizLoading ? '⏳' : '🔄 Restart'}
                                </button>
                            )}

                            {/* Online Users Button */}
                            <button
                                onClick={() => setShowOnlineUsers(true)}
                                className="px-3 lg:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold flex items-center gap-1 lg:gap-2"
                            >
                                👥 <span>{onlineCount}</span>
                                <span className="hidden lg:inline">{onlineCount === 1 ? 'korisnik' : 'korisnika'}</span>
                            </button>

                            {/* Leaderboard Button */}
                            <button
                                onClick={() => setShowLeaderboard(true)}
                                className="px-3 lg:px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-semibold"
                            >
                                🏆 <span className="hidden sm:inline">Leaderboard</span>
                            </button>

                            {/* Change Username Button */}
                            <button
                                onClick={handleChangeUsername}
                                className="px-3 lg:px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                            >
                                <span className="hidden lg:inline">Promeni Ime</span>
                                <span className="lg:hidden">👤</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Leaderboard Modal */}
            <Leaderboard
                isOpen={showLeaderboard}
                onClose={() => setShowLeaderboard(false)}
            />

            {/* Online Users Modal */}
            <OnlineUsers
                currentUsername={username}
                isOpen={showOnlineUsers}
                onClose={() => setShowOnlineUsers(false)}
                onCountChange={setOnlineCount}
            />

            {/* Main Content Area */}
            <div className="flex-1 max-w-4xl w-full mx-auto p-4 overflow-hidden">
                {/* Chat Messages */}
                <div className="bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
                    {/* Messages List */}
                    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 mt-8">
                                Nema poruka. Započni konverzaciju!
                            </div>
                        ) : (
                            messages.map((message: Message, index: number) => {
                                const isBot = message.username.includes('Bot');
                                const isCurrentUser = message.username === username;
                                const isHint = isBot && message.content.includes('💡');
                                const isTimeUp = isBot && message.content.includes('⏰');
                                const isQuestion = isBot && message.content.includes('📚');

                                // Find the last question message (most recent one with 📚)
                                const lastQuestionIndex = messages.map((m, i) =>
                                    m.username.includes('Bot') && m.content.includes('📚') ? i : -1
                                ).filter(i => i !== -1).pop();

                                const isLatestQuestion = isQuestion && index === lastQuestionIndex;

                                // Hide user messages during active quiz (only show bot messages and your own)
                                const shouldHideMessage = quizRunning && !isBot && !isCurrentUser;
                                
                                if (shouldHideMessage) {
                                    return null; // Don't render hidden messages
                                }

                                return (
                                    <div
                                        key={message.id}
                                        className={`flex ${isBot ? 'justify-center' : isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`${isBot ? 'max-w-lg' : 'max-w-xs lg:max-w-md'
                                                } px-4 py-3 rounded-2xl ${isBot
                                                    ? isHint
                                                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 shadow-lg font-mono'
                                                        : isTimeUp
                                                            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                                                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                                    : isCurrentUser
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-200 text-gray-800'
                                                }`}
                                        >
                                            <div className="font-semibold text-sm mb-1">
                                                {message.username}
                                            </div>
                                            <div className="break-words whitespace-pre-line">
                                                {(() => {
                                                    // Auto-detect image URLs (flagcdn.com or common image extensions)
                                                    const imageMatch = message.content.match(/(https?:\/\/[^\s]+\.(?:png|jpg|jpeg|gif|webp))/i) ||
                                                        message.content.match(/(https?:\/\/flagcdn\.com[^\s]+)/);

                                                    if (imageMatch) {
                                                        const imageUrl = imageMatch[1];
                                                        const parts = message.content.split(imageUrl);

                                                        return (
                                                            <>
                                                                {parts[0]}
                                                                <div className="my-2">
                                                                    <img
                                                                        src={imageUrl}
                                                                        alt="Quiz slika"
                                                                        className="rounded-lg max-w-full h-auto shadow-md"
                                                                        style={{ maxHeight: '300px' }}
                                                                        onLoad={scrollToBottom}
                                                                    />
                                                                </div>
                                                                {parts[1]}
                                                            </>
                                                        );
                                                    }
                                                    return message.content;
                                                })()}
                                            </div>

                                            {/* Flag Question Button - Only show for the LATEST quiz question when quiz is active */}
                                            {isLatestQuestion && quizRunning && currentQuestionId && (
                                                <div className="mt-3 pt-2 border-t border-white/20">
                                                    {flaggedQuestions.has(currentQuestionId) ? (
                                                        <div className="text-xs px-3 py-1 bg-green-500/30 rounded-full text-white">
                                                            ✓ Označeno
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleFlagQuestion(currentQuestionId)}
                                                            className="text-xs px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
                                                        >
                                                            🚩 Glupo pitanje
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            <div
                                                className={`text-xs mt-1 ${isBot || isCurrentUser
                                                    ? isHint
                                                        ? 'text-gray-800 opacity-75'
                                                        : 'text-white opacity-75'
                                                    : 'text-gray-500'
                                                    }`}
                                            >
                                                {new Date(message.created_at).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form
                        onSubmit={handleSendMessage}
                        className="border-t border-gray-200 p-4"
                    >
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Napiši poruku..."
                                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-gray-900 placeholder:text-gray-500"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Pošalji
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
