import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  Link as LinkIcon, 
  AlertCircle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { CampusNotice, NoticeCategory, NoticeUrgency } from '../types/notice';
import { SAMPLE_RAW_NOTICES, SampleMessyNotice } from '../data/seedData';
import { parseNoticeLocally } from '../utils/localParser';

interface SmartNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNotice: (notice: CampusNotice) => void;
}

export const SmartNoticeModal: React.FC<SmartNoticeModalProps> = ({
  isOpen,
  onClose,
  onAddNotice,
}) => {
  const [rawText, setRawText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Extracted/Editable Fields
  const [hasExtracted, setHasExtracted] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('Academic');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [summary, setSummary] = useState('');
  const [urgency, setUrgency] = useState<NoticeUrgency>('upcoming');
  const [actionUrl, setActionUrl] = useState('');
  const [organizer, setOrganizer] = useState('');

  if (!isOpen) return null;

  // Handle Quick Sample Click
  const handleSelectSample = (sample: SampleMessyNotice) => {
    setRawText(sample.sourceText);
    setExtractError(null);
  };

  // Perform AI Extraction via backend /api/extract-notice or local fallback
  const handleExtract = async () => {
    if (!rawText.trim()) {
      setExtractError('Please paste a notice or select a quick sample.');
      return;
    }

    setIsExtracting(true);
    setExtractError(null);

    try {
      // Call backend API
      const res = await fetch('/api/extract-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText }),
      });

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        const d = json.data;
        setTitle(d.title || 'Campus Event');
        setCategory(d.category || 'General');
        setDate(d.date || new Date().toISOString().split('T')[0]);
        setTime(d.time || '');
        setVenue(d.venue || 'Campus');
        setSummary(d.summary || '');
        setUrgency(d.urgency || 'upcoming');
        setActionUrl(d.actionUrl || '');
        setOrganizer(d.organizer || 'Campus Life');
        setHasExtracted(true);
      } else {
        // Fallback to local heuristic parser
        console.warn('Backend extraction fallback triggered:', json.error);
        const local = parseNoticeLocally(rawText);
        setTitle(local.title);
        setCategory(local.category);
        setDate(local.date);
        setTime(local.time || '');
        setVenue(local.venue || '');
        setSummary(local.summary);
        setUrgency(local.urgency);
        setActionUrl(local.actionUrl || '');
        setOrganizer(local.organizer || '');
        setHasExtracted(true);
      }
    } catch (err: any) {
      console.warn('Network error, applying instant local extraction:', err);
      const local = parseNoticeLocally(rawText);
      setTitle(local.title);
      setCategory(local.category);
      setDate(local.date);
      setTime(local.time || '');
      setVenue(local.venue || '');
      setSummary(local.summary);
      setUrgency(local.urgency);
      setActionUrl(local.actionUrl || '');
      setOrganizer(local.organizer || '');
      setHasExtracted(true);
    } finally {
      setIsExtracting(false);
    }
  };

  // Save Extracted Notice to Dashboard
  const handleSaveNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setExtractError('Title is required');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isToday = date === todayStr;

    const newNotice: CampusNotice = {
      id: `notice-${Date.now()}`,
      title: title.trim(),
      category,
      date: date || todayStr,
      time: time.trim() || undefined,
      venue: venue.trim() || undefined,
      summary: summary.trim() || 'No additional summary provided.',
      urgency: isToday ? 'urgent' : urgency,
      isToday,
      isStarred: false,
      isCompleted: false,
      actionUrl: actionUrl.trim() || undefined,
      organizer: organizer.trim() || undefined,
      rawSourceText: rawText,
      createdAt: Date.now(),
    };

    onAddNotice(newNotice);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setRawText('');
    setHasExtracted(false);
    setTitle('');
    setDate('');
    setTime('');
    setVenue('');
    setSummary('');
    setActionUrl('');
    setOrganizer('');
    setExtractError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {hasExtracted ? 'Review Extracted Card' : 'Smart Notice Intake'}
              </h2>
              <p className="text-xs text-slate-400">
                {hasExtracted
                  ? 'Verify or adjust details before adding to your board'
                  : 'Paste unstructured forwards, WhatsApp texts, or flyers to extract structured details'}
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
          {!hasExtracted ? (
            <div className="space-y-4">
              
              {/* Quick Sample Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Try a realistic sample message:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {SAMPLE_RAW_NOTICES.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className="px-2.5 py-1 text-xs rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 whitespace-nowrap transition-colors cursor-pointer"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notice Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Raw Notice Text <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste messy WhatsApp forwards, emails, announcements, e.g.:&#10;'*URGENT: CS304 Midterm Lab scheduled tomorrow at 9:30 AM in Lab 304. Bring ID card! Submit github link tonight...'"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-500 transition-colors"
                />
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                  <span>Extracts title, date, time, venue, category & urgency</span>
                  <span>{rawText.length} characters</span>
                </div>
              </div>

              {extractError && (
                <div className="flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-900/60 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{extractError}</span>
                </div>
              )}

              {/* Extract CTA */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={isExtracting || !rawText.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${isExtracting ? 'animate-spin' : ''}`} />
                  <span>{isExtracting ? 'Extracting with Gemini AI...' : 'Extract & Parse'}</span>
                </button>
              </div>

            </div>
          ) : (
            <form onSubmit={handleSaveNotice} className="space-y-4">
              
              {/* Title Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none text-white font-medium"
                />
              </div>

              {/* Category & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Events">Events & Fests</option>
                    <option value="Clubs">Clubs & Societies</option>
                    <option value="Placement">Placement & Internships</option>
                    <option value="General">General Campus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Urgency Flag
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as NoticeUrgency)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200"
                  >
                    <option value="urgent">Urgent (&lt; 48 hours)</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="expired">Expired / Passed</option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Event / Deadline Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Time Window
                  </label>
                  <input
                    type="text"
                    value={time}
                    placeholder="e.g. 10:00 AM - 1:00 PM, 11:59 PM"
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200"
                  />
                </div>
              </div>

              {/* Venue & Organizer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Venue / Location
                  </label>
                  <input
                    type="text"
                    value={venue}
                    placeholder="e.g. Audi 2, Lab 304, Zoom link"
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Organizer / Club
                  </label>
                  <input
                    type="text"
                    value={organizer}
                    placeholder="e.g. Dept of CSE, GDSC, Placement Cell"
                    onChange={(e) => setOrganizer(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200"
                  />
                </div>
              </div>

              {/* Summary Description */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Actionable Summary
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="1-2 sentences on what the student actually needs to do"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200"
                />
              </div>

              {/* Action URL */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Registration / Submission URL (Optional)
                </label>
                <input
                  type="url"
                  value={actionUrl}
                  placeholder="https://..."
                  onChange={(e) => setActionUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setHasExtracted(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← Edit Raw Notice
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Add to Dashboard</span>
                  </button>
                </div>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
