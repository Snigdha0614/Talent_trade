import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Briefcase,
  Star,
  PlusCircle,
  Clock,
  ArrowRight,
  ArrowLeftRight,
  DollarSign,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Project, Service, Proposal } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import ProjectCard from '../components/ProjectCard.js';

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;
      setIsLoading(true);
      try {
        if (user.role === 'FREELANCER') {
          const [projRes, srvRes] = await Promise.all([
            api.projects.list({ freelancerId: user.id }),
            api.services.list({ freelancerId: user.id }),
          ]);
          setProjects(projRes.projects || []);
          setServices(srvRes.services || []);
        } else {
          // Client
          const projRes = await api.projects.list({ clientId: user.id });
          setProjects(projRes.projects || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-xs text-slate-500">Please sign in to access your dashboard.</p>
        <Link to="/login" className="mt-3 inline-block px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg">
          Log In
        </Link>
      </div>
    );
  }

  const activeProjects = projects.filter((p) => p.status !== 'COMPLETED' && p.status !== 'EXCHANGE_COMPLETED');
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED' || p.status === 'EXCHANGE_COMPLETED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Greeting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user.profileImage || '/src/assets/images/avatar_freelancer_priya_1790830248285.jpg'}
            alt={user.name}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-full object-cover border-2 border-slate-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Welcome, {user.name}</h1>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {user.role} Dashboard
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {user.title || (user.role === 'FREELANCER' ? 'Specialist Workspace' : 'Client Operations')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user.role === 'FREELANCER' ? (
            <Link
              to="/offer-service"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Offer New Service</span>
            </Link>
          ) : (
            <Link
              to="/post-project"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Project</span>
            </Link>
          )}

          <Link
            to="/profile/edit"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-2xs"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Metrics Row (Zero-Pill Tabular-Nums) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Active Workspaces</span>
          <p className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {activeProjects.length}
          </p>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 block">In progress & review</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Completed Projects</span>
          <p className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
            {completedProjects.length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Successfully delivered</span>
        </div>

        {user.role === 'FREELANCER' ? (
          <>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Active Gigs Offered</span>
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
                {services.length}
              </p>
              <span className="text-[11px] text-slate-400 font-medium mt-1 block">Discoverable in search</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Client Satisfaction</span>
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1 flex items-center gap-1">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>{user.rating.toFixed(1)}</span>
              </p>
              <span className="text-[11px] text-slate-400 font-medium mt-1 block font-mono">
                {user.reviewCount} total reviews
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Total Projects Posted</span>
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">
                {projects.length}
              </p>
              <span className="text-[11px] text-slate-400 font-medium mt-1 block">Paid and barter briefs</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Client Rating</span>
              <p className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1 flex items-center gap-1">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>{user.rating.toFixed(1)}</span>
              </p>
              <span className="text-[11px] text-slate-400 font-medium mt-1 block font-mono">
                {user.reviewCount} peer reviews
              </span>
            </div>
          </>
        )}
      </div>

      {/* Main Section 1: Active Projects / Workspaces */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Active Workspaces</h2>
            <p className="text-xs text-slate-500">Track tasks, deliverables, and client milestone approvals</p>
          </div>
          <Link to="/projects" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
            View all projects →
          </Link>
        </div>

        {activeProjects.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-2xl border border-slate-200">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No active projects right now</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {user.role === 'FREELANCER'
                ? 'Apply to open projects or publish gigs to get hired.'
                : 'Post a project or browse services to hire specialists.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>

      {/* Main Section 2: If Freelancer, Show My Services */}
      {user.role === 'FREELANCER' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">My Published Services & Gigs</h2>
              <p className="text-xs text-slate-500">Your active listings in the marketplace</p>
            </div>
            <Link to="/offer-service" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              + New Service
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="bg-white p-10 text-center rounded-2xl border border-slate-200">
              <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No services published yet</p>
              <Link
                to="/offer-service"
                className="mt-3 inline-block px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg shadow-xs"
              >
                Create Your First Gig
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {services.map((srv) => (
                <div key={srv.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {srv.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-900">${srv.price.toLocaleString()}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500 font-mono">{srv.views} views</span>
                    </div>
                    <Link to={`/services/${srv.id}`} className="text-xs font-bold text-slate-900 hover:text-indigo-600">
                      {srv.title}
                    </Link>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/services/${srv.id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      Preview
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
