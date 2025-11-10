'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase, Message } from '@/lib/supabase';
import { postQuizQuestion, handleAnswerCheck, stopQuiz, isQuizActive } from '@/lib/quizBot';

export default function ChatRoom({ username }: { username: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizRunning, setQuizRunning] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMessages();
        const cleanup = subscribeToMessages();

        // Check if quiz is already running
        setQuizRunning(isQuizActive());

        return cleanup;
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(100);

            if (error) throw error;
            setMessages(data || []);
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
                console.log('Subscription status:', status);
            });

        return () => {
            console.log('Cleaning up subscription...');
            supabase.removeChannel(channel);
        };
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const messageContent = newMessage.trim();

        try {
            const { error } = await supabase.from('messages').insert({
                username: username,
                content: messageContent,
            });

            if (error) throw error;
            setNewMessage('');

            // If quiz is active, check if this is an answer attempt
            if (quizRunning && typeof window !== 'undefined') {
                const hasActiveQuestion = sessionStorage.getItem('currentQuizAnswer');
                if (hasActiveQuestion) {
                    // Wait a bit for the message to be sent, then check answer
                    setTimeout(() => {
                        handleAnswerCheck(messageContent, username);
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Greška pri slanju poruke');
        }
    };

    const handleStartQuiz = async () => {
        setQuizLoading(true);
        try {
            await postQuizQuestion();
            setQuizRunning(true);
        } catch (error) {
            console.error('Error triggering quiz bot:', error);
            alert('Greška pri pokretanju kviza');
        } finally {
            setQuizLoading(false);
        }
    };

    const handleStopQuiz = () => {
        stopQuiz();
        setQuizRunning(false);
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
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Čet Soba</h1>
                        <p className="text-sm text-gray-600">Korisnik: {username}</p>
                    </div>
                    <div className="flex gap-2">
                        {!quizRunning ? (
                            <button
                                onClick={handleStartQuiz}
                                disabled={quizLoading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {quizLoading ? '🤖 Učitavanje...' : '🤖 Pokreni Kviz'}
                            </button>
                        ) : (
                            <button
                                onClick={handleStopQuiz}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition animate-pulse"
                            >
                                🛑 Zaustavi Kviz
                            </button>
                        )}
                        <button
                            onClick={handleChangeUsername}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                        >
                            Promeni Ime
                        </button>
                    </div>
                </div>
            </header>

            {/* Messages Container */}
            <div className="flex-1 max-w-4xl w-full mx-auto p-4 overflow-hidden flex flex-col">
                <div className="bg-white rounded-2xl shadow-xl flex-1 flex flex-col overflow-hidden">
                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 mt-8">
                                Nema poruka. Započni konverzaciju!
                            </div>
                        ) : (
                            messages.map((message: Message) => {
                                const isBot = message.username.includes('Bot');
                                const isCurrentUser = message.username === username;
                                const isHint = isBot && message.content.includes('💡');
                                const isTimeUp = isBot && message.content.includes('⏰');

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
                                                {message.content}
                                            </div>
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
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
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
