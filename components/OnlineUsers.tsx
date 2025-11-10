'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface OnlineUser {
  username: string;
  presence_ref: string;
  online_at: string;
}

export default function OnlineUsers({ currentUsername }: { currentUsername: string }) {
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
  }, [currentUsername]);

  return (
    <div className="w-48 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Online Korisnici
        </h3>
        <p className="text-xs text-gray-600 mt-1">
          {onlineUsers.length} {onlineUsers.length === 1 ? 'korisnik' : onlineUsers.length < 5 ? 'korisnika' : 'korisnika'}
        </p>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-2">
        {onlineUsers.length === 0 ? (
          <div className="text-center text-gray-400 text-sm p-4">
            Nema korisnika
          </div>
        ) : (
          <div className="space-y-1">
            {onlineUsers.map((user) => {
              const isCurrentUser = user.username === currentUsername;
              return (
                <div
                  key={user.presence_ref}
                  className={`flex items-center gap-2 p-2 rounded-lg transition ${
                    isCurrentUser
                      ? 'bg-indigo-100 border border-indigo-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Avatar/Status */}
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                      isCurrentUser
                        ? 'bg-indigo-600'
                        : 'bg-gradient-to-br from-purple-400 to-pink-400'
                    }`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>

                  {/* Username */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${
                      isCurrentUser ? 'text-indigo-800' : 'text-gray-800'
                    }`}>
                      {user.username}
                    </div>
                    {isCurrentUser && (
                      <div className="text-xs text-indigo-600">Vi</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          💬 Real-time chat
        </div>
      </div>
    </div>
  );
}

