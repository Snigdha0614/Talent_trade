import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowLeftRight, DollarSign, ArrowRight } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

const CATEGORIES = [
  'Artificial Intelligence',
  'Web Development',
  'Graphic Design',
  'Video Editing',
  'Data Science',
  'Marketing',
];

export default function PostProjectPage() {
  const { user, quickDemoLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [skillsInput, setSkillsInput] = useState('React, TypeScript, Tailwind CSS');
  const [budget, setBudget] = useState('5000');
  const [deadline, setDeadline] = useState('2026-10-30');
  const [mode, setMode] = useState<'PAID' | 'SKILL_EXCHANGE'>('PAID');
  const [clientOfferedSkill, setClientOfferedSkill] = useState('');
  const [exchangeTerms, setExchangeTerms] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (targetStatus: 'PUBLISHED' | 'DRAFT') => {
    if (!title.trim() || !description.trim() || !deadline) {
      setError('Please provide project title, description, and deadline.');
      return;
    }

    if (mode === 'PAID' && (!budget || Number(budget) <= 0)) {
      setError('Please provide a valid project budget.');
      return;
    }

    if (mode === 'SKILL_EXCHANGE' && !clientOfferedSkill.trim()) {
      setError('Please specify what skill you will offer in exchange.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const requiredSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await api.projects.create({
        title: title.trim(),
        description: description.trim(),
        category,
        requiredSkills,
        budget: mode === 'PAID' ? Number(budget) : 0,
        deadline,
        mode,
        clientOfferedSkill: mode === 'SKILL_EXCHANGE' ? clientOfferedSkill.trim() : undefined,
        exchangeTerms: mode === 'SKILL_EXCHANGE' ? exchangeTerms.trim() : undefined,
        status: targetStatus,
      });

      if (res.project) {
        toast.success(targetStatus === 'PUBLISHED' ? 'Project brief posted successfully!' : 'Project draft saved!');
        navigate(`/projects/${res.project.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to post project.');
      toast.error(err.message || 'Failed to post project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Client Portal</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">Post a Project</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Describe the challenge you need solved. Receive competitive proposals from top freelancers or barter skills.
        </p>
      </div>

      {user?.role !== 'CLIENT' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
          <div>
            <span className="font-bold">Client Account Recommended to Commission Work:</span>
            <p className="text-[11px] text-emerald-800 mt-0.5">You are currently {user ? `logged in as a ${user.role.toLowerCase()}` : 'viewing as a guest'}. Switch or log in to manage client proposals and payments.</p>
          </div>
          <button
            type="button"
            onClick={() => quickDemoLogin('client')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shrink-0 transition-colors shadow-xs"
          >
            Instant Client Demo Login
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Project Mode Selector (Section 10) */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-2">Project Compensation Mode</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('PAID')}
              className={`p-3.5 border rounded-xl flex items-center gap-2.5 text-left transition-all ${
                mode === 'PAID'
                  ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900 ring-1 ring-indigo-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <DollarSign className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold">Paid Project</h4>
                <p className="text-[11px] text-slate-500">Pay freelancer via monetary escrow</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('SKILL_EXCHANGE')}
              className={`p-3.5 border rounded-xl flex items-center gap-2.5 text-left transition-all ${
                mode === 'SKILL_EXCHANGE'
                  ? 'border-emerald-600 bg-emerald-50/40 text-emerald-900 ring-1 ring-emerald-600'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <ArrowLeftRight className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold">Skill Barter Project</h4>
                <p className="text-[11px] text-slate-500">Exchange your skill instead of cash</p>
              </div>
            </button>
          </div>
        </div>

        {/* Project Title */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Project Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Full-Stack FinTech Dashboard in React & Tailwind"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-indigo-600"
            required
          />
        </div>

        {/* Category & Skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Domain Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-600"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Required Skills (Comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. React, Python, UI Design"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-600"
            />
          </div>
        </div>

        {/* Budget or Barter Fields */}
        {mode === 'PAID' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Estimated Budget ($ / ₹)
              </label>
              <input
                type="number"
                min={50}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Target Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-600 font-mono"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4 bg-emerald-50/40 border border-emerald-200/80 rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Skill You Offer in Return:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Digital Marketing & Brand Strategy"
                  value={clientOfferedSkill}
                  onChange={(e) => setClientOfferedSkill(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Target Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Exchange Terms / Reciprocal Deliverables:
              </label>
              <input
                type="text"
                placeholder="e.g. 5 hours of brand strategy consulting for 1 complete website UI"
                value={exchangeTerms}
                onChange={(e) => setExchangeTerms(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-emerald-600"
              />
            </div>
          </div>
        )}

        {/* Project Description */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Detailed Project Description & Scope <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={5}
            placeholder="Outline background, deliverables, expected milestones, acceptance criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-indigo-600"
            required
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>Publish Project</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
