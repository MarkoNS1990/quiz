'use client';

import { useState } from 'react';

export default function UsernameForm({ onSubmit }: { onSubmit: (username: string) => void }) {
    const [username, setUsername] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            onSubmit(username.trim());
        }
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
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="npr. gamer123, ninja, marko"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                            required
                            minLength={2}
                            maxLength={30}
                            autoFocus
                        />
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

