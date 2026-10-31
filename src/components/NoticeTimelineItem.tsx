import React from 'react';
import { Calendar, Clock, MapPin, ExternalLink, Star, CheckCircle2, Trash2, CalendarPlus, AlertTriangle } from 'lucide-react';
import { CampusNotice } from '../types/notice';
import { getGoogleCalendarUrl } from '../utils/calendar';

interface NoticeTimelineItemProps {
  notice: CampusNotice;
  onToggleStar: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenDetails: (notice: CampusNotice) => void;
}

export const NoticeTimelineItem: React.FC<NoticeTimelineItemProps> = ({
  notice,
  onToggleStar,
  onToggleComplete,
  onDelete,
  onOpenDetails,
}) => {
  const isCompleted = !!notice.isCompleted;

  const categoryColor = {
    Academic: 'text-indigo-400',
    Events: 'text-pink-400',
    Clubs: 'text-emerald-400',
    Placement: 'text-amber-400',
    General: 'text-slate-400',
  }[notice.category] || 'text-slate-400';

  return (
    <div
      className={`flex items-center justify-between gap-4 p-3.5 rounded-xl border transition-all ${
        isCompleted
          ? 'bg-slate-950/40 border-slate-900 opacity-60'
          : notice.isToday
          ? 'bg-rose-950/20 border-rose-900/50 shadow-sm'
          : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Left Date Column & Title */}
      <div className="flex items-center gap-3 min-w-0">
        
        {/* Date block */}
        <div className="w-16 shrink-0 text-center py-1 px-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono">
          <span className="block text-[10px] uppercase text-slate-500">
            {new Date(notice.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
          </span>
          <span className="block text-sm font-bold text-white tabular-nums">
            {new Date(notice.date + 'T00:00:00').getDate() || notice.date.split('-')[2]}
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] mb-0.5">
            <span className={`font-semibold ${categoryColor}`}>{notice.category}</span>
            <span className="text-slate-600">·</span>
            {notice.time && (
              <span className="text-slate-400 font-mono truncate">{notice.time}</span>
            )}
            {notice.isToday && (
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider px-1.5 py-0.2 rounded bg-rose-950 border border-rose-900">
                Today
              </span>
            )}
          </div>

          <h4
            onClick={() => onOpenDetails(notice)}
            className={`text-xs sm:text-sm font-semibold truncate cursor-pointer hover:text-indigo-300 transition-colors ${
              isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
            }`}
          >
            {notice.title}
          </h4>

          {notice.venue && (
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
              <span>{notice.venue}</span>
            </p>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 shrink-0 text-xs">
        <button
          onClick={() => onToggleStar(notice.id)}
          className={`p-1.5 rounded-md hover:bg-slate-800 transition-colors ${
            notice.isStarred ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
          }`}
          title={notice.isStarred ? 'Starred' : 'Star'}
        >
          <Star className={`w-3.5 h-3.5 ${notice.isStarred ? 'fill-amber-400' : ''}`} />
        </button>

        <button
          onClick={() => onToggleComplete(notice.id)}
          className={`p-1.5 rounded-md hover:bg-slate-800 transition-colors ${
            isCompleted ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
          title="Mark done"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </button>

        <a
          href={getGoogleCalendarUrl(notice)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors hidden sm:inline-block"
          title="Google Calendar"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
        </a>

        <button
          onClick={() => onDelete(notice.id)}
          className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
