import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  DollarSign,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Shield,
  Star,
  Award,
  Zap,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Service, User } from '../types.js';
import ServiceCard from '../components/ServiceCard.js';
import FreelancerCard from '../components/FreelancerCard.js';
import { useAuth } from '../context/AuthContext.js';

export default function HomePage() {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [featuredFreelancers, setFeaturedFreelancers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { quickDemoLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [srvRes, freeRes] = await Promise.all([
          api.services.list(),
          api.users.getFreelancers(),
        ]);
        setFeaturedServices(srvRes.services?.slice(0, 4) || []);
        setFeaturedFreelancers(freeRes.freelancers?.slice(0, 3) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDemoStart = async (role: 'freelancer' | 'client' | 'admin') => {
    await quickDemoLogin(role);
    if (role === 'admin') navigate('/admin');
    else navigate('/dashboard');
  };

  const steps = [
    { num: '01', title: 'Register & Role', desc: 'Sign up as a Freelancer, Client, or explore both.' },
    { num: '02', title: 'Profile & Skills', desc: 'Add verified skills, education, and portfolio pieces.' },
    { num: '03', title: 'Discover Services', desc: 'Browse curated service gigs or post bespoke project briefs.' },
    { num: '04', title: 'Choose Mode', desc: 'Select standard Paid Contract or peer-to-peer Skill Barter.' },
    { num: '05', title: 'Project Workspace', desc: 'Collaborate with live messaging, task lists, and file uploads.' },
    { num: '06', title: 'Submit & Review', desc: 'Deliver work, request revisions, and approve milestones.' },
    { num: '07', title: 'Payment & Review', desc: 'Release simulated escrow or finish barter, then exchange ratings.' },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>The Freelance & Skill Barter Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Trade Skills. <br />
                <span className="text-indigo-600">Find Talent.</span> <br />
                Build Together.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                A modern freelance marketplace where you can hire world-class talent with monetary contracts, offer
                your expertise, or directly exchange skills without relying only on money.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/freelancers"
                  className="px-5 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Find Talent</span>
                </Link>

                <Link
                  to="/offer-service"
                  className="px-5 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-slate-600" />
                  <span>Offer Your Skills</span>
                </Link>

                <Link
                  to="/skill-exchange"
                  className="px-5 py-3 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-2"
                >
                  <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                  <span>Explore Skill Exchange</span>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Milestone Workspace</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero-Cash Skill Barter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Simulated Escrow</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 group">
                <img
                  src="/src/assets/images/hero_talent_collab_1790830235984.jpg"
                  alt="Talent collaboration in modern studio"
                  referrerPolicy="no-referrer"
                  className="w-full h-80 object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>Real-Time Skill Barter Active</span>
                  </div>
                  <h3 className="text-white text-lg font-bold mt-1">
                    Python Machine Learning ⇄ Brand UI/UX Design
                  </h3>
                  <p className="text-slate-300 text-xs mt-1">
                    Priya & Alex exchanged 12 hours of code mentoring for full design system guidelines.
                  </p>
                </div>
              </div>

              {/* Floating Evaluator Quickstart Card */}
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Instant Evaluator Demo Login:</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Password: Demo@123</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2.5">
                  <button
                    onClick={() => handleDemoStart('freelancer')}
                    className="py-1.5 px-2 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg text-center transition-colors shadow-xs"
                  >
                    Freelancer
                  </button>
                  <button
                    onClick={() => handleDemoStart('client')}
                    className="py-1.5 px-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-center transition-colors shadow-xs"
                  >
                    Client
                  </button>
                  <button
                    onClick={() => handleDemoStart('admin')}
                    className="py-1.5 px-2 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg text-center transition-colors shadow-xs"
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unique Highlight Section: Paid vs Skill Exchange */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">The Dual Mode Advantage</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Choose How You Want To Work
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Every gig, project, or hire can be settled with cash or through our revolutionary peer skill barter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Paid Service */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 hover:border-indigo-400 transition-all shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">01. Paid Service Mode</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Hire top talent using straightforward monetary rates. Escrow protection holds the funds safely until
                you review and accept final deliverables.
              </p>

              <ul className="mt-5 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Fixed price or hourly milestone contracts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Instant simulated UPI, Card, and Wallet receipts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Formal revision requests and deliverable sign-offs</span>
                </li>
              </ul>
            </div>

            <Link
              to="/services"
              className="mt-6 inline-flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <span>Browse Paid Services</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Skill Exchange */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 hover:border-emerald-400 transition-all shadow-xs flex flex-col justify-between bg-radial from-emerald-50/40 to-white">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">02. Skill Exchange Mode</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Unique Feature
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Have skills but low cash? Exchange your expertise. Teach Python to get a website designed; edit a
                commercial video to receive growth marketing advice.
              </p>

              <ul className="mt-5 space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero financial cost — reciprocal talent barter</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Synchronized dual workspace with dual task lists</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Build real portfolio items and earn verified reviews</span>
                </li>
              </ul>
            </div>

            <Link
              to="/skill-exchange"
              className="mt-6 inline-flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/80 rounded-lg transition-colors"
            >
              <span>Explore Skill Barter Economy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How TalentTrade Works: 7-Step Lifecycle Journey */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">End-to-End Workflow</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            How TalentTrade Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Follow the complete project lifecycle from registration to final portfolio showcase.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.slice(0, 4).map((s) => (
            <div key={s.num} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-mono font-bold text-indigo-600">{s.num}</span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">{s.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {steps.slice(4).map((s) => (
            <div key={s.num} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-mono font-bold text-emerald-600">{s.num}</span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">{s.title}</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Featured Offerings</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">Top-Rated Services</h2>
          </div>

          <Link
            to="/services"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View all services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredServices.map((srv) => (
              <ServiceCard key={srv.id} service={srv} />
            ))}
          </div>
        )}
      </section>

      {/* Featured Specialists */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Verified Creators</span>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">Meet Top Freelancers</h2>
          </div>

          <Link
            to="/freelancers"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Browse all talent</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredFreelancers.map((free) => (
            <FreelancerCard key={free.id} freelancer={free} />
          ))}
        </div>
      </section>

      {/* Why TalentTrade Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Why TalentTrade?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              A collaborative network designed for creators and builders.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Whether you need to scale your startup with paid engineering contracts or exchange skills to bootstrap
              your idea, TalentTrade provides the tools, protection, and community you need.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-colors shadow-sm"
              >
                Join TalentTrade Free
              </Link>
              <Link
                to="/skill-exchange"
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
              >
                Learn About Skill Barter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
