import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3">
            <Link to="/" className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                TT
              </span>
              <span>TalentTrade</span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Trade Skills. Find Talent. Build Together. The complete freelance platform combining professional paid
              services and peer-to-peer skill exchange barter.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Skill Barter Economy Enabled</span>
            </div>
          </div>

          {/* Quick links: For Clients */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">For Clients</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <Link to="/freelancers" className="hover:text-indigo-600 transition-colors">
                  Find Freelancers
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-indigo-600 transition-colors">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/post-project" className="hover:text-indigo-600 transition-colors">
                  Post a Project
                </Link>
              </li>
              <li>
                <Link to="/skill-exchange" className="hover:text-indigo-600 transition-colors">
                  Propose Skill Exchange
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick links: For Freelancers */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">For Freelancers</h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <Link to="/projects" className="hover:text-indigo-600 transition-colors">
                  Browse Projects
                </Link>
              </li>
              <li>
                <Link to="/offer-service" className="hover:text-indigo-600 transition-colors">
                  Offer a Service / Gig
                </Link>
              </li>
              <li>
                <Link to="/skill-exchange" className="hover:text-indigo-600 transition-colors">
                  Explore Skill Swaps
                </Link>
              </li>
              <li>
                <Link to="/profile/edit" className="hover:text-indigo-600 transition-colors">
                  Profile & Skills Manager
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Trust & Demo */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Academic & Demo</h4>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Simulated Environment</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Includes full mock payment gateway (UPI/Cards), live workspace chat, task trackers, and role-based access.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} TalentTrade Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-500">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
              <span>Built for collaborative talent barter</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
