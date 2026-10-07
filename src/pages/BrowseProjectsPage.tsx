import React, { useEffect, useState } from 'react';
import { Search, Filter, RotateCcw, Briefcase } from 'lucide-react';
import { api } from '../services/api.js';
import { Project } from '../types.js';
import ProjectCard from '../components/ProjectCard.js';

const CATEGORIES = [
  'All',
  'Artificial Intelligence',
  'Web Development',
  'Graphic Design',
  'Video Editing',
  'Data Science',
];

export default function BrowseProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [mode, setMode] = useState('ALL');

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      if (mode && mode !== 'ALL') params.mode = mode;

      const res = await api.projects.list(params);
      setProjects(res.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [category, mode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleReset = () => {
    setSearch('');
    setCategory('All');
    setMode('ALL');
    api.projects.list().then((r) => setProjects(r.projects || []));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Open Bids & Contracts</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">Browse Projects</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Apply to client project briefs with tailored proposals or collaborate via peer skill exchange.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects by title, requirements, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-indigo-600"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs whitespace-nowrap"
          >
            Search Projects
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-indigo-600"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Engagement Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-indigo-600"
            >
              <option value="ALL">All Modes (Paid & Barter)</option>
              <option value="PAID">Paid Contracts Only</option>
              <option value="SKILL_EXCHANGE">Skill Exchange Only</option>
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

      {/* Grid */}
      <div>
        <p className="text-xs text-slate-500 mb-4">
          Showing <strong className="text-slate-800 font-mono tabular-nums">{projects.length}</strong> active projects
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-56 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Projects Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => (
              <ProjectCard key={proj.id} project={proj} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
