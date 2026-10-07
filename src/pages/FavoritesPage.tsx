import React, { useEffect, useState } from 'react';
import { Heart, Users, Briefcase, Layers } from 'lucide-react';
import { api } from '../services/api.js';
import { User, Service, Project } from '../types.js';
import ServiceCard from '../components/ServiceCard.js';
import FreelancerCard from '../components/FreelancerCard.js';
import ProjectCard from '../components/ProjectCard.js';

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<'freelancers' | 'services' | 'projects'>('freelancers');
  const [freelancers, setFreelancers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const res = await api.wishlist.get();
      setFreelancers(res.freelancers || []);
      setServices(res.services || []);
      setProjects(res.projects || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">Saved Items</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">My Favorites</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Quickly access specialists, service packages, and open contracts you have bookmarked.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('freelancers')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'freelancers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Freelancers</span>
          <span className="text-[10px] font-mono text-slate-400">({freelancers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'services' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Services</span>
          <span className="text-[10px] font-mono text-slate-400">({services.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'projects' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Projects</span>
          <span className="text-[10px] font-mono text-slate-400">({projects.length})</span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-56 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {activeTab === 'freelancers' && (
            <div>
              {freelancers.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                  <Heart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No saved freelancers</p>
                  <p className="text-xs text-slate-400 mt-0.5">Explore the directory to bookmark talented creators.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {freelancers.map((free) => (
                    <FreelancerCard key={free.id} freelancer={free} isFavorited={true} onFavoriteToggled={loadFavorites} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'services' && (
            <div>
              {services.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                  <Heart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No saved services</p>
                  <p className="text-xs text-slate-400 mt-0.5">Save gig packages to review and compare later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {services.map((srv) => (
                    <ServiceCard key={srv.id} service={srv} isFavorited={true} onFavoriteToggled={loadFavorites} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              {projects.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                  <Heart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No saved projects</p>
                  <p className="text-xs text-slate-400 mt-0.5">Save project briefs to prepare proposals.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {projects.map((proj) => (
                    <ProjectCard key={proj.id} project={proj} isFavorited={true} onFavoriteToggled={loadFavorites} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
