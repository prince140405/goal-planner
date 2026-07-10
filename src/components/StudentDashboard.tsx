import React, { useState } from 'react';
import { Plus, Check, GraduationCap, FileText, Video, Trophy, Trash2, Edit2, ChevronRight, ChevronLeft, Bookmark } from 'lucide-react';
import { PlacementApplication, PlacementPrep } from '../types';

interface StudentDashboardProps {
  applications: PlacementApplication[];
  placementPrep: PlacementPrep | null;
  onAddApplication: (app: Omit<PlacementApplication, 'id' | 'userId' | 'updatedAt'>) => void;
  onUpdateApplication: (id: string, updates: Partial<PlacementApplication>) => void;
  onDeleteApplication: (id: string) => void;
  onUpdatePlacementPrep: (prep: PlacementPrep) => void;
}

const STAGES = [
  { key: 'wishlist', label: 'Wishlist', color: 'border-l-zinc-500 text-text-muted bg-zinc-500/5' },
  { key: 'applied', label: 'Applied', color: 'border-l-indigo-400 text-indigo-650 dark:text-indigo-400 bg-indigo-500/5' },
  { key: 'interviewing', label: 'Interviewing', color: 'border-l-cyan-400 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5' },
  { key: 'offer', label: 'Offer 🎉', color: 'border-l-emerald-400 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5' },
  { key: 'rejected', label: 'Rejected', color: 'border-l-rose-400 text-rose-600 dark:text-rose-455 bg-rose-500/5' },
] as const;

export default function StudentDashboard({
  applications,
  placementPrep,
  onAddApplication,
  onUpdateApplication,
  onDeleteApplication,
  onUpdatePlacementPrep,
}: StudentDashboardProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingApp, setEditingApp] = useState<PlacementApplication | null>(null);

  // Form State
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [stage, setStage] = useState<PlacementApplication['stage']>('wishlist');
  const [notes, setNotes] = useState('');

  // Local placement prep states
  const currentDsa = placementPrep?.dsaCount || 0;
  const currentInterviews = placementPrep?.mockInterviews || 0;
  const currentResume = placementPrep?.resumeStatus || 'draft';

  const updatePrep = (updates: Partial<PlacementPrep>) => {
    onUpdatePlacementPrep({
      dsaCount: updates.dsaCount !== undefined ? updates.dsaCount : currentDsa,
      mockInterviews: updates.mockInterviews !== undefined ? updates.mockInterviews : currentInterviews,
      resumeStatus: updates.resumeStatus !== undefined ? updates.resumeStatus : currentResume,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !role) return;

    if (editingApp) {
      onUpdateApplication(editingApp.id, {
        company,
        role,
        stage,
        notes,
      });
      setEditingApp(null);
    } else {
      onAddApplication({
        company,
        role,
        stage,
        notes,
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setCompany('');
    setRole('');
    setStage('wishlist');
    setNotes('');
    setShowAddForm(false);
  };

  const handleEditClick = (app: PlacementApplication) => {
    setEditingApp(app);
    setCompany(app.company);
    setRole(app.role);
    setStage(app.stage);
    setNotes(app.notes);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Preparation Metrics & Tracker Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* DSA Problems Solved */}
        <div className="bento-card p-5 relative overflow-hidden bg-gradient-to-br from-bg-card to-bg-app border border-border-card">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-cyan-400">
            <Trophy className="w-20 h-20" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-text-muted">DSA Problems Solved</span>
            </div>
            <span className="text-[10px] text-text-dim font-mono font-bold">Target: 250+</span>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-display text-text-title">{currentDsa}</span>
              <span className="text-xs text-text-dim">solved</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => updatePrep({ dsaCount: Math.max(0, currentDsa - 5) })}
                className="w-7 h-7 rounded bg-bg-active border border-border-input hover:bg-bg-active/80 text-xs text-text-app font-bold cursor-pointer transition-colors"
                title="Subtract 5"
              >
                -5
              </button>
              <button
                onClick={() => updatePrep({ dsaCount: currentDsa + 1 })}
                className="w-7 h-7 rounded bg-cyan-650 hover:bg-cyan-500 text-xs text-white font-bold cursor-pointer transition-all"
                title="Add 1"
              >
                +1
              </button>
              <button
                onClick={() => updatePrep({ dsaCount: currentDsa + 5 })}
                className="w-7 h-7 rounded bg-cyan-650 hover:bg-cyan-500 text-xs text-white font-bold cursor-pointer transition-all"
                title="Add 5"
              >
                +5
              </button>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-bg-active overflow-hidden mt-3.5">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentDsa / 250) * 100)}%` }}
            />
          </div>
        </div>

        {/* Mock Interviews */}
        <div className="bento-card p-5 relative overflow-hidden bg-gradient-to-br from-bg-card to-bg-app border border-border-card">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-purple-400">
            <Video className="w-20 h-20" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-650 dark:text-purple-400">
                <Video className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-text-muted">Mock Interviews</span>
            </div>
            <span className="text-[10px] text-text-dim font-mono font-bold">Target: 10+</span>
          </div>

          <div className="mt-2 flex items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold font-display text-text-title">{currentInterviews}</span>
              <span className="text-xs text-text-dim">completed</span>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => updatePrep({ mockInterviews: Math.max(0, currentInterviews - 1) })}
                className="w-7 h-7 rounded bg-bg-active border border-border-input hover:bg-bg-active/80 text-xs text-text-app font-bold cursor-pointer transition-colors"
              >
                -1
              </button>
              <button
                onClick={() => updatePrep({ mockInterviews: currentInterviews + 1 })}
                className="w-7 h-7 rounded bg-purple-600 hover:bg-purple-500 text-xs text-white font-bold cursor-pointer transition-all"
              >
                +1
              </button>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full bg-bg-active overflow-hidden mt-3.5">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (currentInterviews / 10) * 100)}%` }}
            />
          </div>
        </div>

        {/* Resume Approval Tracker */}
        <div className="bento-card p-5 relative overflow-hidden bg-gradient-to-br from-bg-card to-bg-app border border-border-card">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-400">
            <FileText className="w-20 h-20" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-text-muted">Resume Review Status</span>
          </div>

          <div className="mt-3 space-y-2">
            <select
              value={currentResume}
              onChange={(e) => updatePrep({ resumeStatus: e.target.value as PlacementPrep['resumeStatus'] })}
              className="w-full bg-bg-input border border-border-input rounded-lg p-2 text-xs font-bold text-text-app focus:border-emerald-500/50 focus:outline-hidden cursor-pointer"
            >
              <option value="draft">Draft Phase</option>
              <option value="under_review">Under Peer/Mentor Review</option>
              <option value="approved">Approved & ATS Optimized ✅</option>
            </select>
            <p className="text-[9px] text-text-dim font-mono">
              {currentResume === 'draft' && '⚠️ Get feedback to level up your resume.'}
              {currentResume === 'under_review' && '⏳ Incorporating review notes and layout edits.'}
              {currentResume === 'approved' && '🎉 Fully optimized and ready to send to recruiters!'}
            </p>
          </div>
        </div>
      </div>

      {/* Applications Pipeline Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-text-title tracking-tight uppercase">Job & Internship Applications</h3>
            <p className="text-[11px] text-text-muted mt-0.5">Track your recruitment phases and interviews.</p>
          </div>
          <button
            onClick={() => {
              setEditingApp(null);
              resetForm();
              setShowAddForm(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/10 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Track Application</span>
          </button>
        </div>

        {/* Board View */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {STAGES.map((col) => {
            const appsInStage = applications.filter((app) => app.stage === col.key);

            return (
              <div
                key={col.key}
                className="bg-bg-card border border-border-subtle rounded-2xl p-3 flex flex-col min-h-[300px]"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-border-subtle">
                  <span className="text-xs font-bold text-text-title">{col.label}</span>
                  <span className="text-[10px] bg-bg-active border border-border-card px-1.5 py-0.2 rounded-full text-text-muted font-mono font-bold">
                    {appsInStage.length}
                  </span>
                </div>

                {/* Content Cards */}
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {appsInStage.length === 0 ? (
                    <div className="h-full flex items-center justify-center border border-dashed border-border-subtle rounded-xl p-4">
                      <span className="text-[10px] text-text-dim font-mono text-center">No applications</span>
                    </div>
                  ) : (
                    appsInStage.map((app) => (
                      <div
                        key={app.id}
                        className={`p-3 rounded-xl border border-border-card bg-bg-card hover:bg-bg-active transition-all hover:scale-[1.01] group border-l-2 ${col.color}`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <h4 className="text-xs font-bold text-text-title group-hover:text-cyan-500 transition-colors leading-tight">
                              {app.role}
                            </h4>
                            <span className="text-[10px] text-text-muted leading-none">{app.company}</span>
                          </div>
                        </div>

                        {app.notes && (
                          <p className="text-[9px] text-text-muted mt-2 line-clamp-2 italic leading-relaxed border-t border-border-subtle pt-1">
                            {app.notes}
                          </p>
                        )}

                        {/* Stage Controls */}
                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-border-subtle opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onDeleteApplication(app.id)}
                            className="p-1 text-text-dim hover:text-rose-500 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleEditClick(app)}
                              className="p-1 text-text-dim hover:text-text-title transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <div className="flex gap-0.5 border border-border-input rounded bg-bg-input p-0.5">
                              <button
                                disabled={col.key === 'wishlist'}
                                onClick={() => {
                                  const stageOrder = STAGES.map((s) => s.key);
                                  const idx = stageOrder.indexOf(col.key);
                                  if (idx > 0) {
                                    onUpdateApplication(app.id, { stage: stageOrder[idx - 1] });
                                  }
                                }}
                                className="p-0.5 text-text-dim hover:text-text-title disabled:opacity-30 disabled:hover:text-text-dim cursor-pointer"
                              >
                                <ChevronLeft className="w-2.5 h-2.5" />
                              </button>
                              <button
                                disabled={col.key === 'rejected'}
                                onClick={() => {
                                  const stageOrder = STAGES.map((s) => s.key);
                                  const idx = stageOrder.indexOf(col.key);
                                  if (idx < stageOrder.length - 1) {
                                    onUpdateApplication(app.id, { stage: stageOrder[idx + 1] });
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

      {/* Add / Edit Application Dialog */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-app/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-bg-card border border-border-card rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-sm font-bold text-text-title uppercase tracking-wider mb-4">
              {editingApp ? 'Edit Application Details' : 'Track Application'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Company</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full bg-bg-input border border-border-input rounded-lg p-2 text-xs text-text-app placeholder-text-dim focus:border-cyan-500/50 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Job Role / Position</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Software Engineer Intern"
                  className="w-full bg-bg-input border border-border-input rounded-lg p-2 text-xs text-text-app placeholder-text-dim focus:border-cyan-500/50 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Recruitment Phase</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as PlacementApplication['stage'])}
                  className="w-full bg-bg-input border border-border-input rounded-lg p-2 text-xs text-text-app focus:border-cyan-500/50 focus:outline-hidden"
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key} className="bg-bg-card">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-text-muted font-bold uppercase tracking-wider block mb-1">Application Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Interview links, prep resources, resume version used..."
                  rows={3}
                  className="w-full bg-bg-input border border-border-input rounded-lg p-2 text-xs text-text-app placeholder-text-dim focus:border-cyan-500/50 focus:outline-hidden resize-none"
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
                  className="px-4 py-2 rounded-lg bg-cyan-650 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/10 cursor-pointer"
                >
                  {editingApp ? 'Update Info' : 'Track App'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
