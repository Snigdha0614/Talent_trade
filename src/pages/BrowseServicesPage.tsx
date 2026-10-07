import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { api } from '../services/api.js';
import { Service } from '../types.js';
import ServiceCard from '../components/ServiceCard.js';

const CATEGORIES = [
  'All',
  'Artificial Intelligence',
  'Web Development',
  'Graphic Design',
  'Video Editing',
  'Data Science',
];

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

export default function BrowseServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [skill, setSkill] = useState(searchParams.get('skill') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [maxDeliveryTime, setMaxDeliveryTime] = useState('');

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      if (skill) params.skill = skill;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minRating) params.minRating = minRating;
      if (maxDeliveryTime) params.maxDeliveryTime = maxDeliveryTime;

      const res = await api.services.list(params);
      setServices(res.services || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [category, skill, minRating, maxDeliveryTime]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices();
  };

  const handleReset = () => {
    setSearch('');
    setCategory('All');
    setSkill('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setMaxDeliveryTime('');
    api.services.list().then((r) => setServices(r.services || []));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Marketplace Directory</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">Find a Service</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore specialized services offered by verified talent. Hire directly or propose a skill exchange barter.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services by keyword, skill, or freelancer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-indigo-600"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            Search Services
          </button>
        </form>

        {/* Filter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Category */}
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

          {/* Skill Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Skill</label>
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

          {/* Rating */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Min Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-indigo-600"
            >
              <option value="">Any Rating</option>
              <option value="4.5">★ 4.5 & above</option>
              <option value="4.8">★ 4.8 & above</option>
              <option value="4.9">★ 4.9 & above</option>
            </select>
          </div>

          {/* Max Delivery Time */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Max Delivery</label>
            <select
              value={maxDeliveryTime}
              onChange={(e) => setMaxDeliveryTime(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-indigo-600"
            >
              <option value="">Any Timeframe</option>
              <option value="3">Up to 3 Days</option>
              <option value="7">Up to 7 Days</option>
              <option value="14">Up to 14 Days</option>
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Min Price ($)</label>
            <input
              type="number"
              placeholder="e.g. 1000"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-indigo-600"
            />
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-1.5 px-3 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Count & Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500">
            Showing <strong className="text-slate-800 font-mono tabular-nums">{services.length}</strong> published{' '}
            {services.length === 1 ? 'service' : 'services'}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <Filter className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No Services Match Your Filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your category, search keywords, or delivery timeframe.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
