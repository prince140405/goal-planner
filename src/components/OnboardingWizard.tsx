import React, { useState } from 'react';
import { Rocket, GraduationCap, Target, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Persona, GoalTemplate } from '../types';
import { GOAL_TEMPLATES } from '../utils/templates';

interface OnboardingWizardProps {
  onComplete: (persona: Persona, selectedTemplateId: string | null) => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPersona, setSelectedPersona] = useState<Persona>('founder');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona);
    // Auto-select template if matching
    const matchingTemplate = GOAL_TEMPLATES.find(t => t.persona === persona);
    setSelectedTemplateId(matchingTemplate ? matchingTemplate.id : null);
    setStep(2);
  };

  const currentTemplate = GOAL_TEMPLATES.find(t => t.id === selectedTemplateId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-app/95 backdrop-blur-md px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-bg-card border border-border-card rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-all duration-300">
        
        {/* Decorative ambient background glows */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-indigo-500' : 'w-4 bg-bg-active'}`} />
          <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-indigo-500' : 'w-4 bg-bg-active'}`} />
          <span className="text-xs text-text-dim ml-auto font-mono">Step {step} of 2</span>
        </div>

        {step === 1 ? (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Initialize Goal Execution OS
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text-title tracking-tight leading-tight">
                Select Your Focus Persona
              </h2>
              <p className="text-text-muted text-sm sm:text-base max-w-lg">
                We custom-tailor your execution dashboard, AI coach briefings, and progress systems based on your daily mission.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Founder Option */}
              <button
                onClick={() => handlePersonaSelect('founder')}
                className="group relative text-left p-6 rounded-2xl border border-border-card bg-bg-card hover:bg-bg-active hover:border-indigo-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-bl-full transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110" />
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                  <Rocket className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-title mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Founder / SaaS Builder
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Focus on validation, building MVPs, pipeline tracking, CRM metrics, and launching products to paying users.
                </p>
              </button>

              {/* Student Option */}
              <button
                onClick={() => handlePersonaSelect('student')}
                className="group relative text-left p-6 rounded-2xl border border-border-card bg-bg-card hover:bg-bg-active hover:border-cyan-500/50 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 rounded-bl-full transform translate-x-4 -translate-y-4 transition-transform group-hover:scale-110" />
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4 group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-title mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  Student / Scholar
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Focus on placement prep, internship trackers, Mock interviews, DSA targets, and resume reviews.
                </p>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-text-title tracking-tight">
                Select Your Starter Blueprint
              </h2>
              <p className="text-text-muted text-sm">
                Get a jumpstart by auto-populating structured goals, milestones, and daily tasks tailored for {selectedPersona === 'founder' ? 'Founders' : 'Students'}.
              </p>
            </div>

            <div className="space-y-4">
              {/* Template choice */}
              {GOAL_TEMPLATES.filter(t => t.persona === selectedPersona).map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                    selectedTemplateId === template.id
                      ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/5'
                      : 'border-border-card bg-bg-card hover:bg-bg-active'
                  }`}
                >
                  <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedTemplateId === template.id ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-border-input'
                  }`}>
                    {selectedTemplateId === template.id && <Check className="w-3 h-3" />}
                  </div>
                  <div className="space-y-2 flex-1">
                    <h3 className="text-sm font-semibold text-text-title">{template.title}</h3>
                    <p className="text-xs text-text-muted">{template.description}</p>
                    {template.milestones.length > 0 && (
                      <div className="mt-3">
                        <span className="text-[10px] uppercase tracking-wider font-mono text-text-dim block mb-1">Pre-loaded milestones:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {template.milestones.map((m, idx) => (
                            <span key={idx} className="text-[10px] bg-bg-active border border-border-card text-text-app px-2 py-0.5 rounded-md">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {/* Start blank option */}
              <button
                onClick={() => setSelectedTemplateId(null)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                  selectedTemplateId === null
                    ? 'border-indigo-500 bg-indigo-500/5'
                    : 'border-border-card bg-bg-card hover:bg-bg-active'
                }`}
              >
                <div className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedTemplateId === null ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-border-input'
                }`}>
                  {selectedTemplateId === null && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-title">Start from Scratch</h3>
                  <p className="text-xs text-text-muted">Initialize a completely blank space. Define your own goals and checklists.</p>
                </div>
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border-card">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-text-muted hover:text-text-title cursor-pointer px-4 py-2 rounded-lg hover:bg-bg-active transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => onComplete(selectedPersona, selectedTemplateId)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Launch My Goal Execution OS
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
