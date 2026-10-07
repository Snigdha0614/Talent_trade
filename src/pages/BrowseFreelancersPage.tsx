import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw, Users } from 'lucide-react';
import { api } from '../services/api.js';
import { User } from '../types.js';
import FreelancerCard from '../components/FreelancerCard.js';

const SKILLS = [
  'Python',
  'Machine Learning',
  'Data Science',
  'Web Development',
  'React',
  'Java',
  'Graphic Design',
  'Video Editing',
  'Content Writing',
  'Digital Marketing',
];

export default function BrowseFreelancersPage() {
  const [searchParams] = useSearchParams();
  const [freelancers, setFreelancers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [skill, setSkill] = useState(searchParams.get('skill') || '');
  const [level, setLevel] = useState('');
  const [minRating, setMinRating] = useState('');
  const [availability, setAvailability] = useState('');

  const fetchFreelancers = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (skill) params.skill = skill;
      if (level) params.level = level;
      if (minRating) params.minRating = minRating;
      if (availability) params.availability = availability;

      const res = await api.users.getFreelancers(params);
      setFreelancers(res.freelancers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelancers();
  }, [skill, level, minRating, availability]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFreelancers();
  };

  const handleReset = () => {
    setSearch('');
    setSkill('');
    setLevel('');
    setMinRating('');
    setAvailability('');
    api.users.getFreelancers().then((r) => setFreelancers(r.freelancers || []));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Talent Network</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">Find Freelancers</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Connect with vetted specialists across engineering, design, AI, and marketing. Open for paid hire or skill swaps.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, expertise, or bio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-indigo-600"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            Search Talent
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Required Skill</label>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-indigo-600"
            >
              <option value="">All Skills</option>
              {SKILLS.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Skill Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-indigo-600"
            >
              <option value="">Any Level</option>
              <option value="Expert">Expert</option>
              <option value="Advanced">Advanced</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Beginner">Beginner</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Min Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-indigo-600"
            >
              <option value="">Any Rating</option>
              <option value="4.8">★ 4.8 & above</option>
              <option value="4.9">★ 4.9 & above</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-indigo-600"
            >
              <option value="">All Availabilities</option>
              <option value="Available">Available Now</option>
              <option value="Busy">Busy</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-1.5 px-3 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Results */}
      <div>
        <p className="text-xs text-slate-500 mb-4">
          Showing <strong className="text-slate-800 font-mono tabular-nums">{freelancers.length}</strong> verified{' '}
          {freelancers.length === 1 ? 'freelancer' : 'freelancers'}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : freelancers.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Freelancers Match Your Filter</h3>
            <p className="text-xs text-slate-500 mt-1">Try broadening your skill selection or availability.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.map((free) => (
              <FreelancerCard key={free.id} freelancer={free} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
