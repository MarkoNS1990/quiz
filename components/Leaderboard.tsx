'use client';

import { useState, useEffect } from 'react';
import { getLeaderboard } from '@/lib/quizBot';
import { UserScore } from '@/lib/supabase';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Leaderboard({ isOpen, onClose }: LeaderboardProps) {
  const [scores, setScores] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadLeaderboard();
    }
  }, [isOpen]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await getLeaderboard(10);
    setScores(data);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">🏆 Leaderboard</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 text-3xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm mt-1 opacity-90">Top 10 igrača</p>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loading ? (
              <div className="text-center py-8 text-gray-600">
                Učitavanje...
              </div>
            ) : scores.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                Nema podataka još. Budi prvi koji će osvojiti poene! 🎯
              </div>
            ) : (
              <div className="space-y-2">
                {scores.map((score, index) => (
                  <div
                    key={score.id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition hover:shadow-md ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400'
                        : index === 1
                        ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-400'
                        : index === 2
                        ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-400'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 text-center">
                      {index === 0 ? (
                        <span className="text-3xl">🥇</span>
                      ) : index === 1 ? (
                        <span className="text-3xl">🥈</span>
                      ) : index === 2 ? (
                        <span className="text-3xl">🥉</span>
                      ) : (
                        <span className="text-xl font-bold text-gray-600">
                          #{index + 1}
                        </span>
                      )}
                    </div>

                    {/* Username */}
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-800">
                        {score.username}
                      </div>
                      <div className="text-sm text-gray-600">
                        {score.correct_answers} tačnih odgovora
                      </div>
                    </div>

                    {/* Points Breakdown */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">
                        {score.total_points}
                      </div>
                      <div className="text-xs text-gray-500 space-x-2">
                        {score.three_point_answers > 0 && (
                          <span>🏆×{score.three_point_answers}</span>
                        )}
                        {score.two_point_answers > 0 && (
                          <span>🥈×{score.two_point_answers}</span>
                        )}
                        {score.one_point_answers > 0 && (
                          <span>🥉×{score.one_point_answers}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-4 border-t">
            <div className="text-sm text-gray-600 text-center">
              <p className="font-semibold mb-2">Sistem bodovanja:</p>
              <div className="flex justify-center gap-6">
                <span>🏆 3 poena (0-10s)</span>
                <span>🥈 2 poena (10-20s)</span>
                <span>🥉 1 poen (20-30s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

