import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle2,
  ArrowLeftRight,
  Heart,
  AlertTriangle,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api.js';
import { User, Service, Review } from '../types.js';
import ServiceCard from '../components/ServiceCard.js';
import SkillExchangeModal from '../components/SkillExchangeModal.js';
import ReportModal from '../components/ReportModal.js';
import { useAuth } from '../context/AuthContext.js';

export default function FreelancerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await api.users.getProfile(id);
        setProfileUser(res.user);
        setServices(res.services || []);
        setReviews(res.reviews || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [id]);

  const toggleFavorite = async () => {
    if (!profileUser) return;
    try {
      const res = await api.wishlist.toggle('FREELANCER', profileUser.id);
      setIsFavorited(res.saved);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading creator profile...
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-base font-bold text-slate-800">Profile Not Found</h2>
        <Link to="/freelancers" className="mt-4 inline-block text-xs font-semibold text-indigo-600">
          Browse all talent
        </Link>
      </div>
    );
  }

  const isSelf = currentUser?.id === profileUser.id;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <img
              src={profileUser.profileImage || '/src/assets/images/avatar_freelancer_priya_1790830248285.jpg'}
              alt={profileUser.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-slate-200 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{profileUser.name}</h1>
                <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {profileUser.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">{profileUser.title || 'Independent Specialist'}</p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2.5">
                {profileUser.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{profileUser.location}</span>
                  </span>
                )}
                <span aria-hidden="true" className="text-slate-300">·</span>
                <div className="flex items-center gap-1 font-mono">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-800 tabular-nums">{profileUser.rating.toFixed(1)}</span>
                  <span className="text-slate-400 text-[11px]">({profileUser.reviewCount} reviews)</span>
                </div>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="font-semibold text-emerald-700">{profileUser.availability}</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {!isSelf && (
              <>
                <button
                  type="button"
                  onClick={() => setExchangeModalOpen(true)}
                  className="flex-1 md:flex-initial px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Propose Skill Barter</span>
                </button>

                <button
                  type="button"
                  onClick={toggleFavorite}
                  className={`p-2 rounded-lg border border-slate-200 transition-colors ${
                    isFavorited ? 'text-rose-600 bg-rose-50' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  aria-label="Save to favorites"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => setReportModalOpen(true)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-200"
                  title="Report user"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </>
            )}

            {isSelf && (
              <Link
                to="/profile/edit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
              >
                Edit My Profile
              </Link>
            )}
          </div>
        </div>

        {/* Bio */}
        {profileUser.bio && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">About</h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl whitespace-pre-line">
              {profileUser.bio}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Skills, Education, Experience, Portfolio */}
        <div className="lg:col-span-8 space-y-6">
          {/* Skills Breakdown (Section 5) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Verified Skills & Proficiency</h2>
              <span className="text-xs text-slate-400 font-mono">{profileUser.skills.length} skills listed</span>
            </div>

            {profileUser.skills.length === 0 ? (
              <p className="text-xs text-slate-400">No skills added yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profileUser.skills.map((sk) => (
                  <div key={sk.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{sk.name}</h4>
                      <span className="text-[11px] text-slate-500">{sk.category}</span>
                    </div>
                    <span className="text-[11px] font-mono font-semibold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded">
                      {sk.level}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Portfolio Projects (Section 18) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Portfolio & Completed Work</h2>

            {profileUser.portfolio.length === 0 ? (
              <p className="text-xs text-slate-400">No portfolio projects showcased yet.</p>
            ) : (
              <div className="space-y-4">
                {profileUser.portfolio.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50/60 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                      {item.completedAt && (
                        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{item.completedAt}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                    {item.skills.length > 0 && (
                      <div className="flex items-center flex-wrap gap-1 text-[11px] text-slate-500 pt-1">
                        <span className="font-semibold text-slate-700">Technologies:</span>
                        {item.skills.map((s, idx) => (
                          <React.Fragment key={s}>
                            <span className="font-medium text-slate-800">{s}</span>
                            {idx < item.skills.length - 1 && (
                              <span aria-hidden="true" className="text-slate-300">·</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Experience & Education */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Experience */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                <span>Experience</span>
              </h3>
              {profileUser.experience.length === 0 ? (
                <p className="text-xs text-slate-400">No experience records added.</p>
              ) : (
                <div className="space-y-3">
                  {profileUser.experience.map((exp) => (
                    <div key={exp.id} className="text-xs space-y-0.5 border-l-2 border-slate-200 pl-3">
                      <h4 className="font-bold text-slate-900">{exp.role}</h4>
                      <p className="text-slate-600">{exp.company} · <span className="font-mono text-slate-400">{exp.duration}</span></p>
                      <p className="text-slate-500 pt-1 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education & Certs */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Education & Certifications</span>
              </h3>

              {profileUser.education.length > 0 && (
                <div className="space-y-2">
                  {profileUser.education.map((edu) => (
                    <div key={edu.id} className="text-xs border-l-2 border-indigo-200 pl-3">
                      <h4 className="font-bold text-slate-900">{edu.degree}</h4>
                      <p className="text-slate-500">{edu.institution} ({edu.year})</p>
                    </div>
                  ))}
                </div>
              )}

              {profileUser.certifications.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">Certifications:</span>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {profileUser.certifications.map((c, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Active Services by this specialist */}
          {services.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Services Offered by {profileUser.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((srv) => (
                  <ServiceCard key={srv.id} service={srv} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Reviews & Quick Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Verified Reviews</h3>
              <div className="flex items-center gap-1 font-mono text-xs font-bold text-slate-900">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{profileUser.rating.toFixed(1)}</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-slate-400">No completed reviews yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {reviews.map((rev) => (
                  <div key={rev.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{rev.reviewerName}</span>
                      <div className="flex items-center gap-0.5 text-amber-500 font-mono text-[11px]">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <SkillExchangeModal
        isOpen={exchangeModalOpen}
        onClose={() => setExchangeModalOpen(false)}
        receiverId={profileUser.id}
        receiverName={profileUser.name}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportedUser={profileUser.id}
        reportedUserName={profileUser.name}
      />
    </div>
  );
}
