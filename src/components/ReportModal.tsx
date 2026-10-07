import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { api } from '../services/api.js';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUser?: string;
  reportedUserName?: string;
  serviceId?: string;
  projectId?: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  reportedUser,
  reportedUserName,
  serviceId,
  projectId,
}: ReportModalProps) {
  const [type, setType] = useState<'Fake Profile' | 'Inappropriate Service' | 'Fraud' | 'Project Dispute'>(
    'Project Dispute'
  );
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide details for the report.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.reports.submit({
        type,
        description: description.trim(),
        evidence: evidence.trim() || undefined,
        reportedUser,
        serviceId,
        projectId,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="relative inline-block w-full max-w-md p-6 sm:p-8 my-8 text-left bg-white rounded-2xl shadow-2xl border border-slate-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">File a Report / Dispute</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md">
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                ✓
              </div>
              <h4 className="text-base font-bold text-slate-900">Report Lodged</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your report has been dispatched to the platform moderation team. You can monitor dispute updates
                in your notification center.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {error}
                </div>
              )}

              {reportedUserName && (
                <div className="text-xs text-slate-500">
                  Reporting user: <strong className="text-slate-800">{reportedUserName}</strong>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dispute / Violation Type:</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-600"
                >
                  <option value="Project Dispute">Project Dispute / Milestone Delay</option>
                  <option value="Fake Profile">Fake Profile / Identity Misrepresentation</option>
                  <option value="Inappropriate Service">Inappropriate Service / Content</option>
                  <option value="Fraud">Fraud / Unauthorized Solicitations</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Explanation:
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain the issue clearly with relevant context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Evidence / Reference Links:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chat message reference or external screenshots"
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-indigo-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
