import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Sparkles, Check, ArrowRight } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

const CATEGORIES = [
  'Artificial Intelligence',
  'Web Development',
  'Graphic Design',
  'Video Editing',
  'Data Science',
];

export default function OfferServicePage() {
  const { user, quickDemoLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [skillsInput, setSkillsInput] = useState('Python, Machine Learning, Scikit-learn');
  const [price, setPrice] = useState('5000');
  const [deliveryTimeDays, setDeliveryTimeDays] = useState('7');
  const [sampleWorkUrl, setSampleWorkUrl] = useState('https://github.com/example/demo-pipeline');
  const [availability, setAvailability] = useState('Available');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (targetStatus: 'PUBLISHED' | 'DRAFT') => {
    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and detailed description for your service.');
      return;
    }

    if (!price || Number(price) <= 0) {
      setError('Please provide a valid service price.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await api.services.create({
        title: title.trim(),
        description: description.trim(),
        category,
        skills: parsedSkills,
        price: Number(price),
        deliveryTimeDays: Number(deliveryTimeDays) || 7,
        sampleWorkUrls: sampleWorkUrl.trim() ? [sampleWorkUrl.trim()] : [],
        availability,
        status: targetStatus,
      });

      if (res.service) {
        toast.success(targetStatus === 'PUBLISHED' ? 'Service gig published successfully!' : 'Service draft saved!');
        navigate(`/services/${res.service.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create service.');
      toast.error(err.message || 'Failed to create service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Gig Creator</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">Offer a Service</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Publish your expertise to prospective clients. Your service will be discoverable for both paid contracts
          and direct skill exchange requests.
        </p>
      </div>

      {user?.role !== 'FREELANCER' && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-900">
          <div>
            <span className="font-bold">Freelancer Account Required to Publish Gigs:</span>
            <p className="text-[11px] text-indigo-700 mt-0.5">You are currently {user ? `logged in as a ${user.role.toLowerCase()}` : 'viewing as a guest'}. Switch or log in to continue.</p>
          </div>
          <button
            type="button"
            onClick={() => quickDemoLogin('freelancer')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shrink-0 transition-colors shadow-xs"
          >
            Instant Freelancer Demo Login
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Service Title */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Service Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Machine Learning Model Development & Deployment"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-indigo-600"
            required
          />
          <p className="text-[11px] text-slate-400 mt-1">Make your service title clear, specific, and action-oriented.</p>
        </div>

        {/* Category & Skills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Category</label>
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
              Target Skills (Comma Separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Python, Machine Learning, Scikit-learn"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-600"
            />
          </div>
        </div>

        {/* Pricing & Delivery Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Price ($ / ₹)</label>
            <input
              type="number"
              min={100}
              step={50}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Delivery Time (Days)</label>
            <input
              type="number"
              min={1}
              max={90}
              value={deliveryTimeDays}
              onChange={(e) => setDeliveryTimeDays(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-600"
            >
              <option value="Available">Available</option>
              <option value="Available (Part-time)">Available (Part-time)</option>
              <option value="Available for Skill Exchange">Available for Skill Exchange</option>
              <option value="Busy">Busy</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Service Description & Scope of Work <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={5}
            placeholder="Describe what you will build, what the client will receive, technical specifications, and milestones..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-indigo-600"
            required
          />
        </div>

        {/* Sample Work URL */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5">
            Sample Work / Portfolio Link
          </label>
          <input
            type="url"
            placeholder="https://github.com/..."
            value={sampleWorkUrl}
            onChange={(e) => setSampleWorkUrl(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-600 font-mono"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>Publish Service</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
