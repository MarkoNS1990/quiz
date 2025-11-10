'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface OnlineUser {
  username: string;
  presence_ref: string;
  online_at: string;
}

interface OnlineUsersProps {
  currentUsername: string;
  isOpen: boolean;
  onClose: () => void;
  onlineCount?: number;
  onCountChange?: (count: number) => void;
}

export default function OnlineUsers({ currentUsername, isOpen, onClose, onCountChange }: OnlineUsersProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    const channel = supabase.channel('online-users');

    // Subscribe to presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: OnlineUser[] = [];
        
        // Extract all users from presence state
        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[];
          presences.forEach((presence) => {
            if (presence.username) {
              users.push({
                username: presence.username,
                presence_ref: key,
                online_at: presence.online_at || new Date().toISOString()
              });
            }
          });
        });

        // Remove duplicates and sort
        const uniqueUsers = Array.from(
          new Map(users.map(user => [user.username, user])).values()
        ).sort((a, b) => a.username.localeCompare(b.username));

        setOnlineUsers(uniqueUsers);
        
        // Notify parent of count change
        if (onCountChange) {
          onCountChange(uniqueUsers.length);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user
          await channel.track({
            username: currentUsername,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.untrack();
      supabase.removeChannel(channel);
    };
  }, [currentUsername, onCountChange]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-80 max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Online Korisnici
              </h3>
              <p className="text-xs text-indigo-100 mt-1">
                {onlineUsers.length} {onlineUsers.length === 1 ? 'korisnik' : onlineUsers.length < 5 ? 'korisnika' : 'korisnika'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4">
          {onlineUsers.length === 0 ? (
            <div className="text-center text-gray-400 text-sm p-4">
              Nema korisnika
            </div>
          ) : (
            <div className="space-y-2">
              {onlineUsers.map((user) => {
                const isCurrentUser = user.username === currentUsername;
                return (
                  <div
                    key={user.presence_ref}
                    className={`flex items-center gap-3 p-3 rounded-lg transition ${
                      isCurrentUser
                        ? 'bg-indigo-100 border border-indigo-300'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Avatar/Status */}
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-base ${
                        isCurrentUser
                          ? 'bg-indigo-600'
                          : 'bg-gradient-to-br from-purple-400 to-pink-400'
                      }`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    {/* Username */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        isCurrentUser ? 'text-indigo-800' : 'text-gray-800'
                      }`}>
                        {user.username}
                      </div>
                      {isCurrentUser && (
                        <div className="text-xs text-indigo-600 font-semibold">Vi</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="text-xs text-gray-500 text-center">
            💬 Real-time presence
          </div>
        </div>
      </div>
    </>
  );
}

