'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function UsernameForm({ onSubmit }: { onSubmit: (username: string) => void }) {
    const [username, setUsername] = useState('');
    const [existingUsernames, setExistingUsernames] = useState<Set<string>>(new Set());
    const [error, setError] = useState('');

    useEffect(() => {
        // Subscribe to online users to check for duplicates
        const channel = supabase.channel('username-check');

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const usernames = new Set<string>();
                
                Object.keys(state).forEach((key) => {
                    const presences = state[key] as any[];
                    presences.forEach((presence) => {
                        if (presence.username) {
                            usernames.add(presence.username.toLowerCase());
                        }
                    });
                });

                setExistingUsernames(usernames);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedUsername = username.trim();
        
        if (!trimmedUsername) {
            setError('Molimo unesite nick');
            return;
        }

        // Check if username already exists (case insensitive)
        if (existingUsernames.has(trimmedUsername.toLowerCase())) {
            setError('Ovaj nick je već zauzet! Izaberite drugi.');
            return;
        }

        setError('');
        onSubmit(trimmedUsername);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
                    🎯 Kosingasi Kviz
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Unesite svoj nick da započnete igru
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vaš Nick
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError(''); // Clear error on change
                            }}
                            placeholder="npr. gamer123, ninja, marko"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white outline-none transition text-gray-900"
                            required
                            minLength={2}
                            maxLength={30}
                            autoFocus
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-600">
                                {error}
                            </p>
                        )}
                        {existingUsernames.size > 0 && (
                            <p className="mt-2 text-xs text-gray-500">
                                {existingUsernames.size} {existingUsernames.size === 1 ? 'igrač' : 'igrača'} online
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!username.trim()}
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Započni Igru
                    </button>
                </form>
            </div>
        </div>
    );
}

