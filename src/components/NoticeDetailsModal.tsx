import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  ExternalLink, 
  CalendarPlus, 
  Download, 
  Star, 
  CheckCircle2, 
  Trash2, 
  FileText,
  Edit2,
  Save
} from 'lucide-react';
import { CampusNotice, NoticeCategory, NoticeUrgency } from '../types/notice';
import { getGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';

interface NoticeDetailsModalProps {
  notice: CampusNotice | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNotice: (updated: CampusNotice) => void;
  onDeleteNotice: (id: string) => void;
  onToggleStar: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

export const NoticeDetailsModal: React.FC<NoticeDetailsModalProps> = ({
  notice,
  isOpen,
  onClose,
  onUpdateNotice,
  onDeleteNotice,
  onToggleStar,
  onToggleComplete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('General');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [summary, setSummary] = useState('');
  const [urgency, setUrgency] = useState<NoticeUrgency>('upcoming');
  const [actionUrl, setActionUrl] = useState('');
  const [organizer, setOrganizer] = useState('');

  useEffect(() => {
    if (notice) {
      setTitle(notice.title);
      setCategory(notice.category);
      setDate(notice.date);
      setTime(notice.time || '');
      setVenue(notice.venue || '');
      setSummary(notice.summary);
      setUrgency(notice.urgency);
      setActionUrl(notice.actionUrl || '');
      setOrganizer(notice.organizer || '');
      setIsEditing(false);
    }
  }, [notice]);

  if (!isOpen || !notice) return null;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = date === todayStr;

    const updated: CampusNotice = {
      ...notice,
      title: title.trim(),
      category,
      date,
      time: time.trim() || undefined,
      venue: venue.trim() || undefined,
      summary: summary.trim(),
      urgency: isToday ? 'urgent' : urgency,
      isToday,
      actionUrl: actionUrl.trim() || undefined,
      organizer: organizer.trim() || undefined,
    };

    onUpdateNotice(updated);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-400">
              {notice.category}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">
              {notice.organizer || 'Campus Life'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            ) : null}

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isEditing ? (
            <div className="space-y-5">
              
              {/* Notice Title */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                  {notice.title}
                </h2>
              </div>

              {/* Date, Time, Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Date</span>
                    <span className="font-mono font-medium">{notice.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Time</span>
                    <span className="font-mono">{notice.time || 'Not specified'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-300 col-span-1 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Location / Venue</span>
                    <span>{notice.venue || 'Campus grounds'}</span>
                  </div>
                </div>
              </div>

              {/* Summary Description */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Actionable Requirements & Summary
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                  {notice.summary}
                </p>
              </div>

              {/* Action Link if available */}
              {notice.actionUrl && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Direct Link / Portal
                  </h4>
                  <a
                    href={notice.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:underline break-all"
                  >
                    <span>{notice.actionUrl}</span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                </div>
              )}

              {/* Original Raw Forward Snippet (if available) */}
              {notice.rawSourceText && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Original Forwarded Message</span>
                  </h4>
                  <pre className="p-3 text-[11px] font-mono text-slate-400 bg-slate-950 rounded-lg border border-slate-800/60 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-36">
                    {notice.rawSourceText}
                  </pre>
                </div>
              )}

            </div>
          ) : (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Events">Events</option>
                    <option value="Clubs">Clubs</option>
                    <option value="Placement">Placement</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Urgency</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  >
                    <option value="urgent">Urgent (&lt; 48h)</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Venue</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Summary</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Action URL</label>
                <input
                  type="url"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        {!isEditing && (
          <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleStar(notice.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
                  notice.isStarred
                    ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                    : 'border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${notice.isStarred ? 'fill-amber-400' : ''}`} />
                <span>{notice.isStarred ? 'Starred' : 'Star'}</span>
              </button>

              <button
                onClick={() => onToggleComplete(notice.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
                  notice.isCompleted
                    ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                    : 'border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{notice.isCompleted ? 'Completed' : 'Mark Done'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={getGoogleCalendarUrl(notice)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 hover:text-white transition-colors"
                title="Add to Google Calendar"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Google Cal</span>
              </a>

              <button
                onClick={() => downloadIcsFile(notice)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                title="Download .ics file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>.ics</span>
              </button>

              <button
                onClick={() => {
                  onDeleteNotice(notice.id);
                  onClose();
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
