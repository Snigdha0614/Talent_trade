import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, ArrowLeftRight, DollarSign, Layers } from 'lucide-react';
import { Project } from '../types.js';
import { api } from '../services/api.js';

interface ProjectCardProps {
  project: Project;
  isFavorited?: boolean;
  onFavoriteToggled?: () => void;
}

export default function ProjectCard({
  project,
  isFavorited = false,
  onFavoriteToggled,
}: ProjectCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.wishlist.toggle('PROJECT', project.id);
      setFavorited(res.saved);
      onFavoriteToggled?.();
    } catch (err) {
      console.error(err);
    }
  };

  const isExchange = project.mode === 'SKILL_EXCHANGE';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 transition-all hover:shadow-md p-5 flex flex-col justify-between">
      <div>
        {/* Header Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">{project.category}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span
              className={`font-semibold flex items-center gap-1 ${
                isExchange ? 'text-emerald-700' : 'text-indigo-700'
              }`}
            >
              {isExchange ? (
                <>
                  <ArrowLeftRight className="w-3 h-3 text-emerald-600" />
                  <span>Skill Exchange</span>
                </>
              ) : (
                <>
                  <DollarSign className="w-3 h-3 text-indigo-600" />
                  <span>Paid Contract</span>
                </>
              )}
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

        {/* Title */}
        <Link to={`/projects/${project.id}`} className="block group">
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
            {project.title}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Barter details or skills */}
        {isExchange && project.clientOfferedSkill && (
          <div className="mt-3 p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-lg text-[11px] text-emerald-900">
            <strong>Offering:</strong> {project.clientOfferedSkill} · <strong>Seeking:</strong>{' '}
            {project.freelancerOfferedSkill || project.requiredSkills.join(', ')}
          </div>
        )}

        {/* Required Skills (Unboxed) */}
        <div className="flex items-center flex-wrap gap-1 text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100">
          <span className="font-semibold text-slate-700">Skills:</span>
          {project.requiredSkills.map((sk, idx) => (
            <React.Fragment key={sk}>
              <span className="font-medium text-slate-600">{sk}</span>
              {idx < project.requiredSkills.length - 1 && (
                <span aria-hidden="true" className="text-slate-300">·</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Footer Area */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div>
          {isExchange ? (
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Agreement</span>
              <span className="text-xs font-bold text-emerald-700 font-mono">Peer Skill Swap</span>
            </div>
          ) : (
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Budget</span>
              <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                ${project.budget.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 block flex items-center gap-1 justify-end">
              <Calendar className="w-3 h-3" />
              <span>Deadline</span>
            </span>
            <span className="text-xs text-slate-600 font-mono tabular-nums">{project.deadline}</span>
          </div>

          <Link
            to={`/projects/${project.id}`}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
          >
            <Layers className="w-3 h-3" />
            <span>Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
