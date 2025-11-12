'use client';

import { useState, useEffect } from 'react';
import { getCustomCategories } from '@/lib/supabase';

interface CategorySelectorProps {
  onStartQuiz: (categories: string[] | null) => void;
  disabled: boolean;
}

export default function CategorySelector({ onStartQuiz, disabled }: CategorySelectorProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showSelector, setShowSelector] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    console.log('🔄 CategorySelector: Loading categories...');
    setLoading(true);
    const cats = await getCustomCategories();
    console.log('📦 CategorySelector: Received categories:', cats);
    setCategories(cats);
    setLoading(false);
  };

  const toggleCategory = (category: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedCategories(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedCategories.size === categories.length) {
      setSelectedCategories(new Set());
    } else {
      setSelectedCategories(new Set(categories));
    }
  };

  const handleStartQuiz = () => {
    console.log('🚀 Starting quiz with categories:', selectedCategories);
    // If no categories selected or all selected, pass null (all questions)
    if (selectedCategories.size === 0 || selectedCategories.size === categories.length) {
      console.log('➡️ All categories selected, passing null');
      onStartQuiz(null);
    } else {
      const selected = Array.from(selectedCategories);
      console.log('➡️ Specific categories selected:', selected);
      onStartQuiz(selected);
    }
    setShowSelector(false);
  };

  if (categories.length === 0) {
    // No custom categories defined, show simple start button
    return (
      <button
        onClick={() => onStartQuiz(null)}
        disabled={disabled}
        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
          disabled
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {disabled ? '🎮 Kviz Aktivan' : '🚀 Pokreni Kviz'}
      </button>
    );
  }

  return (
    <div className="relative">
      {!showSelector ? (
        <div className="flex gap-2">
          <button
            onClick={() => onStartQuiz(null)}
            disabled={disabled}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              disabled
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {disabled ? '🎮 Kviz Aktivan' : '🚀 Pokreni Kviz (Sve)'}
          </button>
          <button
            onClick={() => {
              console.log('🔘 Kliknut Izaberi Oblasti button');
              setShowSelector(true);
            }}
            disabled={disabled}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              disabled
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
            }`}
            title="Izaberi oblasti"
          >
            📂 Izaberi Oblasti
          </button>
        </div>
      ) : (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSelector(false)}>
          <div className="bg-white rounded-lg shadow-2xl p-6 border-2 border-blue-500 max-h-96 overflow-y-auto w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-xl text-gray-800">📂 Izaberi Oblasti</h3>
            <button
              onClick={() => {
                console.log('❌ Zatvaranje selektora');
                setShowSelector(false);
              }}
              className="text-gray-500 hover:text-gray-700 font-bold text-2xl leading-none"
            >
              ✕
            </button>
          </div>

          <div className="mb-3">
            <label className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.size === categories.length}
                onChange={toggleSelectAll}
                className="w-4 h-4"
              />
              <span className="font-semibold text-blue-600">
                {selectedCategories.size === categories.length ? '✓ Sve oblasti' : 'Izaberi sve'}
              </span>
            </label>
          </div>

          <div className="border-t pt-2 space-y-1">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.has(category)}
                  onChange={() => toggleCategory(category)}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className="text-gray-700">{category}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t flex gap-2">
            <button
              onClick={handleStartQuiz}
              disabled={selectedCategories.size === 0}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedCategories.size === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
              }`}
            >
              🚀 Pokreni Kviz
              {selectedCategories.size > 0 && selectedCategories.size < categories.length && (
                <span className="ml-1">({selectedCategories.size})</span>
              )}
            </button>
            <button
              onClick={() => setShowSelector(false)}
              className="px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
            >
              Otkaži
            </button>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

