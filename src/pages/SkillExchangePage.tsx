import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  User as UserIcon,
} from 'lucide-react';
import { api } from '../services/api.js';
import { SkillExchangeRequest, Project, User } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import SkillExchangeModal from '../components/SkillExchangeModal.js';

export default function SkillExchangePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [exchanges, setExchanges] = useState<SkillExchangeRequest[]>([]);
  const [exchangeProjects, setExchangeProjects] = useState<Project[]>([]);
  const [freelancers, setFreelancers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newModalOpen, setNewModalOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [selectedPartnerName, setSelectedPartnerName] = useState('');

  const loadExchangeData = async () => {
    setIsLoading(true);
    try {
      const [exRes, projRes, freeRes] = await Promise.all([
        api.exchange.list(),
        api.projects.list({ mode: 'SKILL_EXCHANGE' }),
        api.users.getFreelancers(),
      ]);
      setExchanges(exRes.exchanges || []);
      setExchangeProjects(projRes.projects || []);
      setFreelancers(freeRes.freelancers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExchangeData();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      const res = await api.exchange.accept(id);
      toast.success('Skill exchange accepted! Workspace created.');
      if (res.project) {
        navigate(`/projects/${res.project.id}`);
      } else {
        await loadExchangeData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept exchange.');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.exchange.reject(id);
      toast.info('Skill exchange request declined.');
      await loadExchangeData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to decline exchange.');
    }
  };

  const incomingRequests = exchanges.filter((ex) => ex.receiverId === user?.id && ex.status === 'PENDING');
  const outgoingRequests = exchanges.filter((ex) => ex.senderId === user?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-radial from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200/80 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 text-xs font-bold rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero-Cash Talent Barter Economy</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Exchange Skills. <br />
            Collaborate Without Money.
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Have expertise to share? Propose a direct barter. Teach machine learning to get your mobile app designed;
            deliver SEO strategy to receive video animation. Both parties build their portfolios and earn verified ratings.
          </p>
        </div>

        <div className="shrink-0 flex flex-col items-center sm:items-start gap-3">
          <img
            src="/src/assets/images/skill_exchange_concept_1790830271145.jpg"
            alt="Skill exchange balance illustration"
            referrerPolicy="no-referrer"
            className="w-48 h-36 object-cover rounded-xl border border-emerald-200 shadow-md hidden sm:block"
          />
          <button
            type="button"
            onClick={() => {
              const defaultPartner = freelancers.find((f) => f.id !== user?.id) || freelancers[0];
              if (defaultPartner) {
                setSelectedPartnerId(defaultPartner.id);
                setSelectedPartnerName(defaultPartner.name);
              }
              setNewModalOpen(true);
            }}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Propose New Skill Barter</span>
          </button>
        </div>
      </div>

      {/* Section 1: Incoming Barter Proposals */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Incoming Exchange Requests</h2>
            <p className="text-xs text-slate-500">Other creators wanting to trade skills with you</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 tabular-nums">
            {incomingRequests.length} pending
          </span>
        </div>

        {incomingRequests.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No pending incoming exchange proposals. Explore talent profiles to propose a trade!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {incomingRequests.map((req) => (
              <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <img
                      src={req.senderAvatar || '/src/assets/images/avatar_freelancer_priya_1790830248285.jpg'}
                      alt={req.senderName}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{req.senderName}</h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <span className="text-emerald-700">Offers: {req.offeredSkill}</span>
                        <ArrowLeftRight className="w-3 h-3 text-slate-400" />
                        <span className="text-indigo-700">Requests: {req.requestedSkill}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {req.description}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Terms: {req.exchangeTerms} · Timeline: {req.durationDays} days
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAccept(req.id)}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept & Launch Workspace</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReject(req.id)}
                    className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Outgoing Barter Proposals */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">Your Sent Exchange Proposals ({outgoingRequests.length})</h2>

        {outgoingRequests.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">You have not sent any exchange proposals yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {outgoingRequests.map((req) => (
              <div key={req.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-800">
                    Proposed to {req.receiverName}:{' '}
                    <span className="font-medium text-slate-600">
                      You offer {req.offeredSkill} ⇄ You request {req.requestedSkill}
                    </span>
                  </p>
                  <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{req.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-2 font-mono">
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      req.status === 'ACCEPTED'
                        ? 'bg-emerald-50 text-emerald-800'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-800'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {req.status}
                  </span>

                  {req.projectId && (
                    <Link
                      to={`/projects/${req.projectId}`}
                      className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-sans font-semibold flex items-center gap-1"
                    >
                      <Layers className="w-3 h-3" />
                      <span>Workspace</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3: Active Skill Exchange Project Workspaces */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Skill Exchange Workspaces</h2>
            <p className="text-xs text-slate-500">Live collaborative workspaces powered by talent barter</p>
          </div>
          <span className="text-xs text-slate-500 font-mono tabular-nums">{exchangeProjects.length} active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exchangeProjects.map((proj) => (
            <div key={proj.id} className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Skill Barter
                  </span>
                  <span className="font-mono text-slate-500">{proj.progress}% Complete</span>
                </div>

                <Link to={`/projects/${proj.id}`} className="block">
                  <h3 className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    {proj.title}
                  </h3>
                </Link>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{proj.description}</p>

                {proj.clientOfferedSkill && (
                  <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-700 font-medium">
                    {proj.clientName} ({proj.clientOfferedSkill}) ⇄ {proj.freelancerName} ({proj.freelancerOfferedSkill})
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Due: {proj.deadline}</span>
                <Link
                  to={`/projects/${proj.id}`}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SkillExchangeModal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        receiverId={selectedPartnerId}
        receiverName={selectedPartnerName || 'Creator'}
        onSuccess={() => loadExchangeData()}
      />
    </div>
  );
}
