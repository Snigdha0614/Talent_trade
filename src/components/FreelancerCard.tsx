import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, MapPin, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { User } from '../types.js';
import { api } from '../services/api.js';
import SkillExchangeModal from './SkillExchangeModal.js';

interface FreelancerCardProps {
  freelancer: User;
  isFavorited?: boolean;
  onFavoriteToggled?: () => void;
}

export default function FreelancerCard({
  freelancer,
  isFavorited = false,
  onFavoriteToggled,
}: FreelancerCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.wishlist.toggle('FREELANCER', freelancer.id);
      setFavorited(res.saved);
      onFavoriteToggled?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all hover:shadow-md p-5 flex flex-col justify-between">
        <div>
          {/* Top Row: Avatar & Basic Info */}
          <div className="flex items-start justify-between gap-3">
            <Link to={`/profile/${freelancer.id}`} className="flex items-center gap-3 group">
              <img
                src={freelancer.profileImage || '/src/assets/images/avatar_freelancer_priya_1790830248285.jpg'}
                alt={freelancer.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  <span>{freelancer.name}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1">{freelancer.title || 'Specialist'}</p>
                {freelancer.location && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span>{freelancer.location}</span>
                  </p>
                )}
              </div>
            </Link>

            <button
              type="button"
              onClick={toggleFavorite}
              className={`p-1.5 rounded-md transition-colors ${
                favorited ? 'text-rose-500' : 'text-slate-300 hover:text-slate-600'
              }`}
              aria-label="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Rating & Availability */}
          <div className="flex items-center gap-3 text-xs mt-3.5 text-slate-600">
            <div className="flex items-center gap-1 font-mono">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-bold text-slate-800 tabular-nums">{freelancer.rating.toFixed(1)}</span>
              <span className="text-slate-400 text-[11px] tabular-nums">({freelancer.reviewCount} reviews)</span>
            </div>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-[11px] font-medium text-emerald-700">{freelancer.availability}</span>
          </div>

          {/* Bio */}
          <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
            {freelancer.bio || 'Verified specialist open for client contracts and skill exchange collaborations.'}
          </p>

          {/* Skills (Zero-Pill discipline: unboxed text with bullets) */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center flex-wrap gap-1 text-[11px] text-slate-600">
              {freelancer.skills.slice(0, 4).map((sk, i) => (
                <React.Fragment key={sk.id}>
                  <span>
                    <strong className="text-slate-800 font-semibold">{sk.name}</strong>{' '}
                    <span className="text-slate-400 font-mono text-[10px]">({sk.level})</span>
                  </span>
                  {i < Math.min(freelancer.skills.length, 4) - 1 && (
                    <span aria-hidden="true" className="text-slate-300">·</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {freelancer.hourlyRate ? (
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Hourly Rate</span>
              <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                ${freelancer.hourlyRate}/hr
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-medium">Open to Barter</div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExchangeModalOpen(true)}
              className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1"
              title="Propose direct skill exchange"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Skill Barter</span>
            </button>

            <Link
              to={`/profile/${freelancer.id}`}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>

      <SkillExchangeModal
        isOpen={exchangeModalOpen}
        onClose={() => setExchangeModalOpen(false)}
        receiverId={freelancer.id}
        receiverName={freelancer.name}
      />
    </>
  );
}
