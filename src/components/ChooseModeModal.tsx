import React from 'react';
import { DollarSign, ArrowLeftRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { Service, User } from '../types.js';

interface ChooseModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service;
  freelancer?: Partial<User>;
  onSelectPaid: () => void;
  onSelectSkillExchange: () => void;
}

export default function ChooseModeModal({
  isOpen,
  onClose,
  service,
  freelancer,
  onSelectPaid,
  onSelectSkillExchange,
}: ChooseModeModalProps) {
  if (!isOpen) return null;

  const targetName = service?.freelancerName || freelancer?.name || 'this specialist';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="relative inline-block w-full max-w-2xl p-6 sm:p-8 my-8 text-left bg-white rounded-2xl shadow-2xl border border-slate-200 transform transition-all">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Service Engagement
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">Choose Service Mode</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-slate-600 mt-3">
            How would you like to collaborate with <strong className="text-slate-900">{targetName}</strong>
            {service ? ` for "${service.title}"` : ''}? TalentTrade supports both standard monetary hiring and direct
            peer-to-peer skill exchange.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Mode 1: Paid Service */}
            <div className="border-2 border-slate-200 hover:border-indigo-600 rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-md group">
              <div>
                <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900">PAID SERVICE</h4>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Hire the freelancer using monetary payment. Secure escrow protection with milestone tracking.
                </p>

                {service && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">Fixed Project Rate:</span>
                    <p className="text-lg font-bold text-slate-900 tabular-nums">
                      ${service.price.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectPaid();
                }}
                className="mt-6 w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Continue with Paid Service</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mode 2: Skill Exchange */}
            <div className="border-2 border-slate-200 hover:border-emerald-600 rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-md group bg-emerald-50/20">
              <div>
                <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-900">SKILL EXCHANGE</h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Popular
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Exchange your skills instead of paying money. Barter your expertise (e.g. Design for Coding, SEO for Video).
                </p>

                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  <span className="text-xs text-slate-400">Financial Cost:</span>
                  <p className="text-lg font-bold text-emerald-700 flex items-center gap-1.5">
                    <span>$0 (Pure Barter)</span>
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectSkillExchange();
                }}
                className="mt-6 w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Continue with Skill Exchange</span>
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
