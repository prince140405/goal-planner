import React, { useState } from 'react';
import { Plus, DollarSign, Target, TrendingUp, Briefcase, Trash2, Edit2, ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import { PipelineItem, FounderStats } from '../types';

interface FounderDashboardProps {
  pipelineItems: PipelineItem[];
  founderStats: FounderStats | null;
  onAddPipelineItem: (item: Omit<PipelineItem, 'id' | 'userId' | 'updatedAt'>) => void;
  onUpdatePipelineItem: (id: string, updates: Partial<PipelineItem>) => void;
  onDeletePipelineItem: (id: string) => void;
  onUpdateFounderStats: (stats: FounderStats) => void;
}

const STAGES = [
  { key: 'lead', label: 'Lead', color: 'border-l-zinc-400 text-text-muted bg-zinc-500/5' },
  { key: 'prospect', label: 'Prospect', color: 'border-l-indigo-400 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5' },
  { key: 'trial', label: 'Trial', color: 'border-l-amber-400 text-amber-600 dark:text-amber-400 bg-amber-500/5' },
  { key: 'customer', label: 'Customer', color: 'border-l-emerald-400 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5' },
  { key: 'lost', label: 'Lost', color: 'border-l-rose-400 text-rose-600 dark:text-rose-400 bg-rose-500/5' },
] as const;

export default function FounderDashboard({
  pipelineItems,
  founderStats,
  onAddPipelineItem,
  onUpdatePipelineItem,
  onDeletePipelineItem,
  onUpdateFounderStats,
}: FounderDashboardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PipelineItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [stage, setStage] = useState<PipelineItem['stage']>('lead');
  const [value, setValue] = useState(0);
  const [notes, setNotes] = useState('');

  // Target Goal State
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [revenueTarget, setRevenueTarget] = useState(founderStats?.revenueTarget || 5000);
  const [monthlyRevenue, setMonthlyRevenue] = useState(founderStats?.monthlyRevenue || 1200);

  const activePipelineValue = pipelineItems
    .filter(item => item.stage !== 'lost' && item.stage !== 'customer')
    .reduce((sum, item) => sum + Number(item.value || 0), 0);

  const customerRecurringValue = pipelineItems
    .filter(item => item.stage === 'customer')
    .reduce((sum, item) => sum + Number(item.value || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company) return;

    if (editingItem) {
      onUpdatePipelineItem(editingItem.id, {
        name,
        company,
        stage,
        value: Number(value),
        notes,
      });
      setEditingItem(null);
    } else {
      onAddPipelineItem({
        name,
        company,
        stage,
        value: Number(value),
        notes,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setName('');
    setCompany('');
    setStage('lead');
    setValue(0);
    setNotes('');
    setShowAddForm(false);
  };

  const handleEditClick = (item: PipelineItem) => {
    setEditingItem(item);
    setName(item.name);
    setCompany(item.company);
    setStage(item.stage);
    setValue(item.value);
    setNotes(item.notes);
    setShowAddForm(true);
  };

  const handleStatsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateFounderStats({
      revenueTarget: Number(revenueTarget),
      monthlyRevenue: Number(monthlyRevenue),
      updatedAt: new Date().toISOString(),
    });
    setIsEditingTarget(false);
  };

  const progressPercent = Math.min(100, Math.round(((founderStats?.monthlyRevenue || monthlyRevenue) / (founderStats?.revenueTarget || revenueTarget || 1)) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MRR Progress Tracker */}
        <div className="bento-card p-5 relative overflow-hidden bg-gradient-to-br from-bg-card to-bg-app border border-border-card">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-indigo-400">
            <DollarSign className="w-20 h-20" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-550 dark:text-indigo-400">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-text-muted">Monthly Revenue Goal</span>
            </div>
            {!isEditingTarget && (
              <button
                onClick={() => setIsEditingTarget(true)}
                className="text-[10px] text-indigo-550 dark:text-indigo-400 hover:underline font-mono font-bold cursor-pointer"
              >
                Edit
              </button>
            )}
          </div>

          {isEditingTarget ? (
            <form onSubmit={handleStatsSubmit} className="space-y-3 mt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-text-dim font-semibold block mb-1">Target MRR ($)</label>
                  <input
                    type="number"
                    value={revenueTarget}
                    onChange={(e) => setRevenueTarget(Number(e.target.value))}
                    className="w-full bg-bg-input border border-border-input rounded-lg p-1.5 text-xs text-text-app font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-text-dim font-semibold block mb-1">Current MRR ($)</label>
                  <input
                    type="number"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                    className="w-full bg-bg-input border border-border-input rounded-lg p-1.5 text-xs text-text-app font-mono"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditingTarget(false)}
                  className="px-2.5 py-1 rounded bg-bg-active border border-border-input text-[10px] text-text-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded bg-indigo-600 text-white text-[10px] font-bold cursor-pointer hover:bg-indigo-500"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-2 space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-display text-text-title">
                  ${(founderStats?.monthlyRevenue ?? monthlyRevenue).toLocaleString()}
                </span>
                <span className="text-xs text-text-dim">
                  / ${(founderStats?.revenueTarget ?? revenueTarget).toLocaleString()} Target
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-text-muted">
                  <span>Goal Completion</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-bg-active overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Pipeline Value */}
        <div className="bento-card p-5 relative overflow-hidden bg-gradient-to-br from-bg-card to-bg-app border border-border-card">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-cyan-400">
            <TrendingUp className="w-20 h-20" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-text-muted">Active Pipeline Value</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-display text-text-title">
              ${activePipelineValue.toLocaleString()}
            </span>
            <p className="text-[10px] text-text-dim mt-1.5">
              Cumulative worth of all leads, prospects, and trial signups.
            </p>
          </div>
        </div>

        {/* Dynamic Customer MRR */}
        <div className="bento-card p-5 relative overflow-hidden bg-gradient-to-br from-bg-card to-bg-app border border-border-card">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-400">
            <Briefcase className="w-20 h-20" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Briefcase className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-text-muted">Dynamic Customer MRR</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-display text-text-title">
              ${customerRecurringValue.toLocaleString()}
            </span>
            <p className="text-[10px] text-text-dim mt-1.5">
              Automatically calculated worth of active customers in CRM.
            </p>
          </div>
        </div>
      </div>

      {/* CRM Stages Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-text-title tracking-tight uppercase">Sales Pipeline CRM</h3>
            <p className="text-[11px] text-text-muted mt-0.5">Track deal advancement and update status stages.</p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deal</span>
          </button>
        </div>

        {/* Pipeline Boards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {STAGES.map((col) => {
            const itemsInStage = pipelineItems.filter((i) => i.stage === col.key);
            const totalStageValue = itemsInStage.reduce((sum, i) => sum + i.value, 0);

            return (
              <div
                key={col.key}
                className="bg-bg-card border border-border-card rounded-2xl p-3 flex flex-col min-h-[300px]"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-border-subtle">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-text-title">{col.label}</span>
                    <span className="text-[10px] bg-bg-active border border-border-card px-1.5 py-0.2 rounded-full text-text-muted font-mono">
                      {itemsInStage.length}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-text-dim font-bold">${totalStageValue.toLocaleString()}</span>
                </div>

                {/* Content Cards */}
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {itemsInStage.length === 0 ? (
                    <div className="h-full flex items-center justify-center border border-dashed border-border-subtle rounded-xl p-4">
                      <span className="text-[10px] text-text-dim font-mono text-center">Empty stage</span>
                    </div>
                  ) : (
                    itemsInStage.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border border-border-card bg-bg-card hover:bg-bg-active transition-all hover:scale-[1.01] group border-l-2 ${col.color}`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <h4 className="text-xs font-bold text-text-title group-hover:text-indigo-500 transition-colors leading-tight">
                              {item.name}
                            </h4>
                            <span className="text-[10px] text-text-muted leading-none">{item.company}</span>
                          </div>
                          <span className="text-[10px] font-bold font-mono text-text-title">${item.value}</span>
                        </div>

                        {item.notes && (
                          <p className="text-[9px] text-text-muted mt-2 line-clamp-2 italic leading-relaxed border-t border-border-subtle pt-1">
                            {item.notes}
                          </p>
                        )}

                        {/* Stage Controls */}
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-border-subtle opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onDeletePipelineItem(item.id)}
                            className="p-1 text-text-dim hover:text-rose-500 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleEditClick(item)}
                              className="p-1 text-text-dim hover:text-text-title transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <div className="flex gap-0.5 border border-border-input rounded bg-bg-input p-0.5">
                              <button
                                disabled={col.key === 'lead'}
                                onClick={() => {
                                  const stageOrder = STAGES.map((s) => s.key);
                                  const idx = stageOrder.indexOf(col.key);
                                  if (idx > 0) {
                                    onUpdatePipelineItem(item.id, { stage: stageOrder[idx - 1] });
                                  }
                                }}
                                className="p-0.5 text-text-dim hover:text-text-title disabled:opacity-30 disabled:hover:text-text-dim cursor-pointer"
                              >
                                <ChevronLeft className="w-2.5 h-2.5" />
                              </button>
                              <button
                                disabled={col.key === 'lost'}
                                onClick={() => {
                                  const stageOrder = STAGES.map((s) => s.key);
                                  const idx = stageOrder.indexOf(col.key);
                                  if (idx < stageOrder.length - 1) {
                                    onUpdatePipelineItem(item.id, { stage: stageOrder[idx + 1] });
                                  }
                                }}
                                className="p-0.5 text-text-dim hover:text-text-title disabled:opacity-30 disabled:hover:text-text-dim cursor-pointer"
                              >
                                <ChevronRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Deal Dialog Backdrop */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-app/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-bg-card border border-border-card rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-sm font-bold text-text-title uppercase tracking-wider mb-4">
              {editingItem ? 'Edit Deal Details' : 'Add New CRM Deal'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Lead/Contact Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-bg-input border border-border-input rounded-lg p-2 text-xs text-text-app placeholder-text-dim focus:border-indigo-500/50 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Company</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe"
                  className="w-full bg-bg-input border border-border-input rounded-lg p-2 text-xs text-text-app placeholder-text-dim focus:border-indigo-500/50 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as PipelineItem['stage'])}
                    className="w-full bg-bg-input border border-border-input rounded-lg p-2 text-xs text-text-app focus:border-indigo-500/50 focus:outline-hidden"
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key} className="bg-bg-card">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Value ($)</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-bg-input border border-border-input rounded-lg p-2 text-xs text-text-app font-mono focus:border-indigo-500/50 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Notes / Deal Outline</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Details about product requirements or discussions..."
                  rows={3}
                  className="w-full bg-bg-input border border-border-input rounded-lg p-2 text-xs text-text-app placeholder-text-dim focus:border-indigo-500/50 focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg bg-bg-active border border-border-input hover:bg-bg-active/80 text-xs font-semibold text-text-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  {editingItem ? 'Update Deal' : 'Add Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
