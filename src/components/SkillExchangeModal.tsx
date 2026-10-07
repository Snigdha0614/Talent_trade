import React, { useState } from 'react';
import { ArrowLeftRight, X, Sparkles } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

interface SkillExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
  targetSkill?: string;
  onSuccess?: () => void;
}

export default function SkillExchangeModal({
  isOpen,
  onClose,
  receiverId,
  receiverName,
  targetSkill,
  onSuccess,
}: SkillExchangeModalProps) {
  const { user } = useAuth();
  const [offeredSkill, setOfferedSkill] = useState(user?.skills?.[0]?.name || '');
  const [requestedSkill, setRequestedSkill] = useState(targetSkill || '');
  const [description, setDescription] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [exchangeTerms, setExchangeTerms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offeredSkill || !requestedSkill || !description) {
      setError('Please fill in what skill you will offer, what you need in return, and the description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.exchange.create({
        receiverId,
        offeredSkill,
        requestedSkill,
        description,
        durationDays: Number(durationDays),
        exchangeTerms: exchangeTerms || `Barter of ${offeredSkill} for ${requestedSkill}`,
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit skill exchange request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="relative inline-block w-full max-w-lg p-6 sm:p-8 my-8 text-left bg-white rounded-2xl shadow-2xl border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Propose Skill Exchange</h3>
                <p className="text-xs text-slate-500">Collaborate with {receiverName} without money</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skill You Will Provide:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Python, SEO, Copywriting"
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skill You Request from {receiverName}:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Graphic Design, React"
                  value={requestedSkill}
                  onChange={(e) => setRequestedSkill(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Exchange Description & Proposal Details:
              </label>
              <textarea
                rows={3}
                placeholder="Explain what deliverables you will produce and what you expect from the partner..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-600 focus:ring-1 focus:ring-indigo-600"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Timeline (Days):
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Exchange Terms (Milestones):
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2 revisions, deliverables via GitHub"
                  value={exchangeTerms}
                  onChange={(e) => setExchangeTerms(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-600"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-800 text-xs flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>
                Once {receiverName} accepts, a dedicated <strong>Skill Exchange Workspace</strong> will be created
                with synchronized tasks, chat, and deliverable review.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Sending Request...' : 'Send Exchange Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
