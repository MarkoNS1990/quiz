'use client';

import { useState, useEffect } from 'react';
import UsernameForm from '@/components/UsernameForm';
import ChatRoom from '@/components/ChatRoom';

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if username is stored in localStorage
    const storedUsername = localStorage.getItem('chatUsername');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    setLoading(false);
  }, []);

  const handleUsernameSubmit = (name: string) => {
    localStorage.setItem('chatUsername', name);
    setUsername(name);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-xl text-gray-600">Učitavanje...</div>
      </div>
    );
  }

  return username ? (
    <ChatRoom username={username} />
  ) : (
    <UsernameForm onSubmit={handleUsernameSubmit} />
  );
}
