import React from 'react';
import { 
  X, 
  Sparkles, 
  AlertCircle, 
  Calendar, 
  Lightbulb, 
  CheckCircle, 
  ArrowRight,
  RefreshCw,
  CalendarPlus
} from 'lucide-react';
import { CampusNotice, WeeklyDigestData } from '../types/notice';

interface WeeklyDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  digest: WeeklyDigestData | null;
  isLoading: boolean;
  onRefreshDigest: () => void;
  notices: CampusNotice[];
}

export const WeeklyDigestModal: React.FC<WeeklyDigestModalProps> = ({
  isOpen,
  onClose,
  digest,
  isLoading,
  onRefreshDigest,
  notices,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-indigo-900/40 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>What Do I Need To Know This Week?</span>
              </h2>
              <p className="text-xs text-slate-400">
                AI executive briefing synthesized from your campus announcements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Synthesizing campus schedule with Gemini 3.8 Flash...
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Prioritizing urgent deadlines, academic submissions, and major events
                </p>
              </div>
            </div>
          ) : digest ? (
            <div className="space-y-5">
              
              {/* Headline & Overview */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-400 block mb-1">
                  Executive Briefing
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                  {digest.headline}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {digest.summary}
                </p>
              </div>

              {/* Critical Deadlines Column */}
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" />
                  <span>High-Priority Deadlines & Action Items</span>
                </div>
                <div className="space-y-2">
                  {digest.criticalDeadlines && digest.criticalDeadlines.length > 0 ? (
                    digest.criticalDeadlines.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 leading-normal"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No urgent deadlines recorded for this week.</p>
                  )}
                </div>
              </div>

              {/* Campus Highlights */}
              <div>
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Campus Life & Networking Highlights</span>
                </div>
                <div className="space-y-2">
                  {digest.campusHighlights && digest.campusHighlights.length > 0 ? (
                    digest.campusHighlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 leading-normal"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No social events noted.</p>
                  )}
                </div>
              </div>

              {/* Student Tip of the Week */}
              {digest.studentTip && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/30 text-amber-200 text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-amber-300 mb-0.5">Survival Tip:</span>
                    <span>{digest.studentTip}</span>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              Click refresh to generate your weekly campus summary.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
          <button
            onClick={onRefreshDigest}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-analyze</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
