import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Clock, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { Service } from '../types.js';
import { api } from '../services/api.js';
import ChooseModeModal from './ChooseModeModal.js';

interface ServiceCardProps {
  service: Service;
  isFavorited?: boolean;
  onFavoriteToggled?: () => void;
  onDirectHire?: (service: Service) => void;
  onDirectExchange?: (service: Service) => void;
}

export default function ServiceCard({
  service,
  isFavorited = false,
  onFavoriteToggled,
  onDirectHire,
  onDirectExchange,
}: ServiceCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [modeModalOpen, setModeModalOpen] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.wishlist.toggle('SERVICE', service.id);
      setFavorited(res.saved);
      onFavoriteToggled?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all hover:shadow-md flex flex-col justify-between overflow-hidden group">
        <div className="p-5">
          {/* Header metadata (Zero-Pill Discipline) */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-700">{service.category}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{service.deliveryTimeDays}d delivery</span>
              </span>
            </div>

            <button
              type="button"
              onClick={toggleFavorite}
              className={`p-1 rounded-md transition-colors ${
                favorited ? 'text-rose-500' : 'text-slate-300 hover:text-slate-600'
              }`}
              aria-label="Save to favorites"
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Service Title */}
          <Link to={`/services/${service.id}`} className="block group-hover:text-indigo-600 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
              {service.title}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {service.description}
          </p>

          {/* Skills (Rendered as clean unboxed text with bullet separators) */}
          <div className="flex items-center flex-wrap gap-1 text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100">
            {service.skills.slice(0, 3).map((sk, idx) => (
              <React.Fragment key={sk}>
                <span className="font-medium text-slate-700">{sk}</span>
                {idx < Math.min(service.skills.length, 3) - 1 && (
                  <span aria-hidden="true" className="text-slate-300">·</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Footer Area with Freelancer info & Action buttons */}
        <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Freelancer Profile */}
          <Link
            to={`/profile/${service.freelancerId}`}
            className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
          >
            <img
              src={service.freelancerAvatar || '/src/assets/images/avatar_freelancer_priya_1790830248285.jpg'}
              alt={service.freelancerName}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{service.freelancerName}</p>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="tabular-nums font-semibold text-slate-700">{service.freelancerRating.toFixed(1)}</span>
              </div>
            </div>
          </Link>

          {/* Pricing & CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Starts at</span>
              <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                ${service.price.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setModeModalOpen(true)}
              className="px-2.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs flex items-center gap-1 whitespace-nowrap"
            >
              <span>Engage</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Mode Selection Modal */}
      <ChooseModeModal
        isOpen={modeModalOpen}
        onClose={() => setModeModalOpen(false)}
        service={service}
        onSelectPaid={() => {
          if (onDirectHire) onDirectHire(service);
          else window.location.href = `/services/${service.id}?mode=paid`;
        }}
        onSelectSkillExchange={() => {
          if (onDirectExchange) onDirectExchange(service);
          else window.location.href = `/services/${service.id}?mode=exchange`;
        }}
      />
    </>
  );
}
