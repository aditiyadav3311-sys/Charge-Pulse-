import React from 'react';
import { Sparkles, Plus, Bell, Calendar as CalendarIcon, Zap } from 'lucide-react';

interface HeaderProps {
  urgentCount: number;
  todayCount: number;
  onOpenIntake: () => void;
  onOpenDigest: () => void;
  isDigestLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  urgentCount,
  todayCount,
  onOpenIntake,
  onOpenDigest,
  isDigestLoading,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Wordmark & Date */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white font-sans">
                  Campus Pulse
                </span>
                <span className="hidden sm:inline-block text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-700/50 text-indigo-300">
                  AI Campus Command
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                One clear place for university notices & deadlines
              </p>
            </div>
          </div>

          {/* Quick Metrics Indicator */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-200">{todayFormatted}</span>
            </div>
            {todayCount > 0 ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 font-medium animate-pulse">
                <Bell className="w-3.5 h-3.5 text-rose-400" />
                <span>{todayCount} due today</span>
              </div>
            ) : urgentCount > 0 ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 font-medium">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>{urgentCount} urgent this week</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300">
                <span>All caught up</span>
              </div>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* What to know this week AI Digest button */}
            <button
              onClick={onOpenDigest}
              disabled={isDigestLoading}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 hover:border-indigo-400/50 transition-all shadow-sm active:scale-95 disabled:opacity-60 cursor-pointer"
              title="Generate AI weekly executive briefing from campus notices"
            >
              <Sparkles className={`w-3.5 h-3.5 text-indigo-400 ${isDigestLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">What do I need to know?</span>
              <span className="sm:hidden">Weekly Digest</span>
            </button>

            {/* Paste Notice Button */}
            <button
              onClick={onOpenIntake}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/25 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Paste Notice</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
