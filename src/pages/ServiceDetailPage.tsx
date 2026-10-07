import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowLeftRight,
  Heart,
  Share2,
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Service, User, Review } from '../types.js';
import ChooseModeModal from '../components/ChooseModeModal.js';
import SkillExchangeModal from '../components/SkillExchangeModal.js';
import ReportModal from '../components/ReportModal.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [service, setService] = useState<Service | null>(null);
  const [freelancer, setFreelancer] = useState<Partial<User> | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modeModalOpen, setModeModalOpen] = useState(false);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    async function loadService() {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await api.services.get(id);
        setService(res.service);
        setFreelancer(res.freelancer);
        setReviews(res.reviews || []);
      } catch (err: any) {
        setError(err.message || 'Service not found.');
      } finally {
        setIsLoading(false);
      }
    }
    loadService();
  }, [id]);

  const handleHirePaid = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!service) return;

    // Create a paid project contract directly from this service
    try {
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + (service.deliveryTimeDays || 7));

      const res = await api.projects.create({
        title: `Contract: ${service.title}`,
        description: `Commissioned service from ${service.freelancerName}. Package: ${service.description}`,
        category: service.category,
        requiredSkills: service.skills,
        budget: service.price,
        deadline: deadlineDate.toISOString().split('T')[0],
        mode: 'PAID',
        status: 'PUBLISHED',
        freelancerId: service.freelancerId,
      });

      if (res.project) {
        toast.success(`Project contract created with ${service.freelancerName}!`);
        navigate(`/projects/${res.project.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not initiate project.');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400 text-xs">
        Loading service details...
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-lg font-bold text-slate-800">Service Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">{error || 'This service may have been unpublished.'}</p>
        <Link
          to="/services"
          className="mt-4 inline-block px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-lg"
        >
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Back */}
      <Link
        to="/services"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to all services</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Service Title & Category (Zero-Pill) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-indigo-600">{service.category}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{service.deliveryTimeDays} days delivery</span>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-mono text-slate-600">{service.views} views</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {service.title}
            </h1>
          </div>

          {/* Specialist Header Bar */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
            <Link
              to={`/profile/${service.freelancerId}`}
              className="flex items-center gap-3 hover:opacity-85 transition-opacity"
            >
              <img
                src={service.freelancerAvatar || '/src/assets/images/avatar_freelancer_priya_1790830248285.jpg'}
                alt={service.freelancerName}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  <span>{service.freelancerName}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                </h3>
                <p className="text-xs text-slate-500">{freelancer?.title || 'Verified Specialist'}</p>
                <div className="flex items-center gap-2 text-xs text-slate-600 mt-0.5">
                  <div className="flex items-center gap-1 font-mono">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="font-bold tabular-nums">{service.freelancerRating.toFixed(1)}</span>
                  </div>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="text-[11px] text-emerald-700 font-medium">{service.availability}</span>
                </div>
              </div>
            </Link>

            <Link
              to={`/profile/${service.freelancerId}`}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
            >
              View Full Profile
            </Link>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">About This Service</h2>
            <div className="text-xs text-slate-600 leading-relaxed space-y-3 whitespace-pre-line">
              {service.description}
            </div>

            {/* Skills & Technologies (Unboxed) */}
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 block mb-2">Technologies & Skills:</span>
              <div className="flex items-center flex-wrap gap-1 text-xs text-slate-600">
                {service.skills.map((sk, i) => (
                  <React.Fragment key={sk}>
                    <span className="font-medium text-slate-800">{sk}</span>
                    {i < service.skills.length - 1 && (
                      <span aria-hidden="true" className="text-slate-300">·</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Sample Work & Portfolio Links */}
          {service.sampleWorkUrls && service.sampleWorkUrls.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
              <h2 className="text-sm font-bold text-slate-900">Sample Deliverables & Code Repositories</h2>
              <ul className="space-y-2 text-xs">
                {service.sampleWorkUrls.map((url, i) => (
                  <li key={i}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 font-mono"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{url}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Client Reviews on this Specialist */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Client Reviews ({reviews.length})
              </h2>
              <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-800">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{service.freelancerRating.toFixed(1)} / 5.0</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400">No client reviews yet for this listing.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {reviews.map((rev) => (
                  <div key={rev.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.reviewerAvatar || '/src/assets/images/avatar_client_marcus_1790830259951.jpg'}
                          alt={rev.reviewerName}
                          referrerPolicy="no-referrer"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-slate-800">{rev.reviewerName}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-xs text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="font-bold text-slate-700">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sticky Checkout & Action Panel */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fixed Package</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900 font-mono tabular-nums">
                  ${service.price.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">or $0 via Skill Barter</span>
              </div>
            </div>

            {/* Dual Mode Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModeModalOpen(true)}
                className="w-full py-3 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Hire / Engage Specialist</span>
              </button>

              <button
                type="button"
                onClick={() => setExchangeModalOpen(true)}
                className="w-full py-2.5 px-4 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />
                <span>Propose Skill Barter ($0)</span>
              </button>
            </div>

            {/* Guarantees */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Escrow milestone release protection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Reciprocal skill exchange verified workflow</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Interactive workspace with live chat & files</span>
              </div>
            </div>

            {/* Utility buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="hover:text-rose-600 transition-colors flex items-center gap-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report Service</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChooseModeModal
        isOpen={modeModalOpen}
        onClose={() => setModeModalOpen(false)}
        service={service}
        onSelectPaid={handleHirePaid}
        onSelectSkillExchange={() => setExchangeModalOpen(true)}
      />

      <SkillExchangeModal
        isOpen={exchangeModalOpen}
        onClose={() => setExchangeModalOpen(false)}
        receiverId={service.freelancerId}
        receiverName={service.freelancerName}
        targetSkill={service.skills[0]}
        onSuccess={() => navigate('/skill-exchange')}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        serviceId={service.id}
        reportedUser={service.freelancerId}
        reportedUserName={service.freelancerName}
      />
    </div>
  );
}
