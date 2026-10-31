import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ExternalLink, 
  Star, 
  CheckCircle2, 
  Trash2, 
  CalendarPlus, 
  Share2, 
  Download,
  AlertTriangle,
  Info
} from 'lucide-react';
import { CampusNotice } from '../types/notice';
import { getGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

interface NoticeCardProps {
  notice: CampusNotice;
  onToggleStar: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenDetails: (notice: CampusNotice) => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  onToggleStar,
  onToggleComplete,
  onDelete,
  onOpenDetails,
}) => {
  const isCompleted = !!notice.isCompleted;

  // Format date readable
  const dateObj = new Date(notice.date + 'T00:00:00');
  const formattedDate = !isNaN(dateObj.getTime())
    ? new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
      }).format(dateObj)
    : notice.date;

  // Category Accent Color Class (unboxed text style)
  const categoryColor = {
    Academic: 'text-indigo-400 font-medium',
    Events: 'text-pink-400 font-medium',
    Clubs: 'text-emerald-400 font-medium',
    Placement: 'text-amber-400 font-medium',
    General: 'text-slate-400 font-medium',
  }[notice.category] || 'text-slate-400';

  // Urgency indicator badge
  const renderUrgencyBadge = () => {
    if (notice.isToday) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/80 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          Needs Attention Today
        </span>
      );
    }
    if (notice.urgency === 'urgent') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 px-2 py-0.5 rounded bg-amber-950/50 border border-amber-800/60">
          <Clock className="w-3 h-3 text-amber-400" />
          Urgent (48h)
        </span>
      );
    }
    if (notice.urgency === 'expired') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
          Passed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/50">
        Upcoming
      </span>
    );
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl bg-slate-900/90 border transition-all duration-200 p-5 ${
        isCompleted
          ? 'border-slate-800/60 opacity-60 bg-slate-950/40'
          : notice.isToday
          ? 'border-rose-900/60 shadow-lg shadow-rose-950/20'
          : 'border-slate-800 hover:border-slate-700 shadow-md hover:shadow-indigo-950/10'
      }`}
    >
      <div>
        {/* Top Header: Unboxed Category & Urgency */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 text-xs">
            <span className={categoryColor}>{notice.category}</span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span className="text-slate-400 text-[11px] truncate max-w-[150px]">
              {notice.organizer || 'Campus Life'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {renderUrgencyBadge()}
            
            {/* Star button */}
            <button
              onClick={() => onToggleStar(notice.id)}
              className={`p-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                notice.isStarred ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title={notice.isStarred ? 'Unstar notice' : 'Star this priority'}
            >
              <Star className={`w-3.5 h-3.5 ${notice.isStarred ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Notice Title */}
        <h3
          onClick={() => onOpenDetails(notice)}
          className={`font-semibold text-base sm:text-[17px] leading-snug tracking-tight cursor-pointer hover:text-indigo-300 transition-colors mb-2 line-clamp-2 ${
            isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
          }`}
        >
          {notice.title}
        </h3>

        {/* Date, Time & Venue strip */}
        <div className="space-y-1.5 mb-3.5 text-xs text-slate-400">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 font-mono text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="font-medium">{formattedDate}</span>
            </div>
            {notice.time && (
              <div className="flex items-center gap-1.5 font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{notice.time}</span>
              </div>
            )}
          </div>

          {notice.venue && (
            <div className="flex items-center gap-1.5 text-slate-400 truncate">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{notice.venue}</span>
            </div>
          )}
        </div>

        {/* Summary */}
        <p className="text-xs sm:text-[13px] leading-relaxed text-slate-300 line-clamp-3 mb-4">
          {notice.summary}
        </p>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto text-xs">
        
        {/* Left Actions: Completed Checkbox & External Link */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleComplete(notice.id)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              isCompleted
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Mark as attended or submitted"
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className="text-[11px]">{isCompleted ? 'Done' : 'Mark done'}</span>
          </button>

          {notice.actionUrl && (
            <a
              href={notice.actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline px-1 py-0.5"
              title="Open registration or submission link"
            >
              <span>Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Right Actions: Calendar Sync, ICS, Delete */}
        <div className="flex items-center gap-1">
          {/* Add to Google Calendar */}
          <a
            href={getGoogleCalendarUrl(notice)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
            title="Add to Google Calendar"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
          </a>

          {/* Download ICS file */}
          <button
            onClick={() => downloadIcsFile(notice)}
            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
            title="Download iCal (.ics) for Apple/Outlook Calendar"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Delete Notice */}
          <button
            onClick={() => onDelete(notice.id)}
            className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            title="Remove notice"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
