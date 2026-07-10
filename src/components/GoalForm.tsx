import React, { useState, useEffect } from 'react';
import { X, Trophy, Target, Award } from 'lucide-react';
import { Goal, GoalType } from '../types';
import { getLocalDateString } from '../utils/date';

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goalData: Omit<Goal, 'id' | 'userId' | 'completed' | 'createdAt' | 'updatedAt'>) => void;
  initialGoal?: Goal;
}

const PRESET_GOAL_CATEGORIES = [
  'Personal Development', 
  'Career / Projects', 
  'Health & Fitness', 
  'Financial Freedom', 
  'Relationships',
  'Interests / Travel'
];

export default function GoalForm({ isOpen, onClose, onSubmit, initialGoal }: GoalFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [type, setType] = useState<GoalType>('short-term');
  const [category, setCategory] = useState('Personal Development');
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialGoal) {
        setTitle(initialGoal.title);
        setDescription(initialGoal.description);
        setTargetDate(initialGoal.targetDate);
        setType(initialGoal.type);
        
        if (PRESET_GOAL_CATEGORIES.includes(initialGoal.category)) {
          setCategory(initialGoal.category);
          setShowCustomCategory(false);
        } else {
          setCategory('Custom');
          setCustomCategory(initialGoal.category);
          setShowCustomCategory(true);
        }
      } else {
        // Safe resets
        setTitle('');
        setDescription('');
        setTargetDate(getLocalDateString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))); // 30 days default
        setType('short-term');
        setCategory('Personal Development');
        setCustomCategory('');
        setShowCustomCategory(false);
      }
    }
  }, [isOpen, initialGoal]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCategory = category === 'Custom' && customCategory.trim()
      ? customCategory.trim()
      : category;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      targetDate,
      type,
      category: finalCategory
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-bg-card border border-border-card rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-card">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            <h3 className="font-display font-semibold text-lg text-text-title">
              {initialGoal ? 'Edit Goal' : 'Define New Goal'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-bg-active text-text-muted hover:text-text-title transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Goal Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Goal Title <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              required
              placeholder="e.g. Run half marathon, read 12 books..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border-input bg-bg-input text-text-app placeholder-text-dim focus:outline-hidden focus:border-indigo-500/50 transition-all text-sm font-medium"
            />
          </div>

          {/* Goal Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Goal Objective / Vision
            </label>
            <textarea
              placeholder="Describe what success looks like or your core motivation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-border-input bg-bg-input text-text-app placeholder-text-dim focus:outline-hidden focus:border-indigo-500/50 transition-all text-sm"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
              Domain / Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                const val = e.target.value;
                setCategory(val);
                setShowCustomCategory(val === 'Custom');
              }}
              className="w-full px-3 py-2 rounded-lg border border-border-input bg-bg-input text-xs font-medium text-text-app focus:outline-hidden cursor-pointer"
            >
              {PRESET_GOAL_CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-bg-card text-text-app">{cat}</option>
              ))}
              <option value="Custom" className="bg-bg-card text-text-app">+ Custom Domain</option>
            </select>
          </div>

          {showCustomCategory && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                Custom Domain Name
              </label>
              <input 
                type="text"
                placeholder="e.g. Academics, Wealth creation"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-border-input bg-bg-input text-xs font-medium text-text-app placeholder-text-dim focus:outline-hidden"
              />
            </div>
          )}

          {/* Goal Type & Target date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                Horizon
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as GoalType)}
                className="w-full px-3 py-1.5 rounded-lg border border-border-input bg-bg-input text-xs font-medium text-text-app focus:outline-hidden cursor-pointer"
              >
                <option value="short-term" className="bg-bg-card text-text-app">Short-term</option>
                <option value="long-term" className="bg-bg-card text-text-app">Long-term</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                Target Date
              </label>
              <input 
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-border-input bg-bg-input text-xs font-medium text-text-app focus:outline-hidden"
              />
            </div>
          </div>
        </form>

        <div className="bg-bg-card/90 px-6 py-4 border-t border-border-card flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold border border-border-input hover:bg-bg-active text-text-muted rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10 transition-colors cursor-pointer"
          >
            {initialGoal ? 'Update Goal' : 'Establish Goal'}
          </button>
        </div>
      </div>
    </div>
  );
}
