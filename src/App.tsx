import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Plus, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Clock, 
  ArrowRight,
  FilterX
} from 'lucide-react';
import { CampusNotice, WeeklyDigestData } from './types/notice';
import { INITIAL_NOTICES } from './data/seedData';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { NoticeCard } from './components/NoticeCard';
import { NoticeTimelineItem } from './components/NoticeTimelineItem';
import { SmartNoticeModal } from './components/SmartNoticeModal';
import { WeeklyDigestModal } from './components/WeeklyDigestModal';
import { NoticeDetailsModal } from './components/NoticeDetailsModal';

const STORAGE_KEY = 'campus_pulse_notices_v2';

export default function App() {
  // Notices State with localStorage persistence
  const [notices, setNotices] = useState<CampusNotice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load notices from storage', e);
    }
    return INITIAL_NOTICES;
  });

  // UI & Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyToday, setOnlyToday] = useState<boolean>(false);
  const [onlyUrgent, setOnlyUrgent] = useState<boolean>(false);
  const [onlyStarred, setOnlyStarred] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'date' | 'urgency' | 'newest'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [isIntakeOpen, setIsIntakeOpen] = useState<boolean>(false);
  const [isDigestOpen, setIsDigestOpen] = useState<boolean>(false);
  const [selectedNotice, setSelectedNotice] = useState<CampusNotice | null>(null);

  // Digest AI State
  const [weeklyDigest, setWeeklyDigest] = useState<WeeklyDigestData | null>(null);
  const [isDigestLoading, setIsDigestLoading] = useState<boolean>(false);

  // Toast / Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
    } catch (e) {
      console.error('Failed to persist notices', e);
    }
  }, [notices]);

  // Priority counts
  const todayStr = new Date().toISOString().split('T')[0];

  const todayNotices = useMemo(() => {
    return notices.filter((n) => !n.isCompleted && (n.isToday || n.date === todayStr));
  }, [notices, todayStr]);

  const urgentCount = useMemo(() => {
    return notices.filter((n) => !n.isCompleted && (n.urgency === 'urgent' || n.isToday)).length;
  }, [notices]);

  // Notice Handlers
  const handleAddNotice = (newNotice: CampusNotice) => {
    setNotices((prev) => [newNotice, ...prev]);
    showToast(`Added "${newNotice.title}" to your campus feed!`);
  };

  const handleUpdateNotice = (updated: CampusNotice) => {
    setNotices((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    setSelectedNotice(updated);
    showToast('Notice updated successfully.');
  };

  const handleDeleteNotice = (id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    showToast('Notice removed.');
  };

  const handleToggleStar = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isStarred: !n.isStarred } : n))
    );
  };

  const handleToggleComplete = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isCompleted: !n.isCompleted } : n))
    );
  };

  const handleResetDemo = () => {
    setNotices(INITIAL_NOTICES);
    setSelectedCategory('all');
    setSearchQuery('');
    setOnlyToday(false);
    setOnlyUrgent(false);
    setOnlyStarred(false);
    showToast('Reset to default campus sample notices.');
  };

  // Generate or open Weekly Digest
  const handleOpenDigest = async () => {
    setIsDigestOpen(true);
    if (!weeklyDigest) {
      await fetchWeeklyDigest();
    }
  };

  const fetchWeeklyDigest = async () => {
    setIsDigestLoading(true);
    try {
      const activeNotices = notices.filter((n) => !n.isCompleted);
      const res = await fetch('/api/weekly-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notices: activeNotices }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.digest) {
        setWeeklyDigest({
          ...data.digest,
          generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      } else {
        // Local synthesis fallback
        generateLocalDigest();
      }
    } catch (err) {
      console.warn('Network issue fetching digest, falling back to local digest:', err);
      generateLocalDigest();
    } finally {
      setIsDigestLoading(false);
    }
  };

  const generateLocalDigest = () => {
    const active = notices.filter((n) => !n.isCompleted);
    const urgentItems = active.filter((n) => n.urgency === 'urgent' || n.isToday);
    const eventItems = active.filter((n) => n.category === 'Events' || n.category === 'Clubs');

    const topDeadlines = urgentItems.slice(0, 3).map(
      (n) => `${n.title} (${n.date}${n.time ? ` at ${n.time}` : ''}) — ${n.venue || 'Campus'}`
    );

    const highlights = eventItems.slice(0, 3).map(
      (n) => `${n.title} by ${n.organizer || 'Student Council'}`
    );

    setWeeklyDigest({
      headline: urgentItems.length > 0 ? 'High-Priority Week: Approaching Deadlines & Drives' : 'Smooth Week Ahead on Campus',
      summary: `You have ${active.length} active announcements tracked. ${
        urgentItems.length > 0
          ? `${urgentItems.length} require immediate attention within the next 48 hours.`
          : 'No immediate crises flagged.'
      } Stay on top of your schedules by syncing items to your calendar.`,
      criticalDeadlines: topDeadlines.length > 0 ? topDeadlines : ['No urgent deadlines due this week.'],
      campusHighlights: highlights.length > 0 ? highlights : ['Explore upcoming student club and fest notices.'],
      studentTip: 'Block 25-minute Pomodoro focus slots before midterm submissions and keep your printed resumes ready for placement drives.',
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // Filtered & Sorted Notices
  const filteredNotices = useMemo(() => {
    let result = [...notices];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((n) => n.category === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.venue && n.venue.toLowerCase().includes(q)) ||
          n.summary.toLowerCase().includes(q) ||
          (n.organizer && n.organizer.toLowerCase().includes(q)) ||
          n.category.toLowerCase().includes(q)
      );
    }

    // Today Only
    if (onlyToday) {
      result = result.filter((n) => n.isToday || n.date === todayStr);
    }

    // Urgent Only
    if (onlyUrgent) {
      result = result.filter((n) => n.urgency === 'urgent' || n.isToday);
    }

    // Starred Only
    if (onlyStarred) {
      result = result.filter((n) => n.isStarred);
    }

    // Sort order
    if (sortBy === 'date') {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'urgency') {
      const rank = { urgent: 0, upcoming: 1, expired: 2 };
      result.sort((a, b) => {
        const rA = a.isToday ? -1 : rank[a.urgency];
        const rB = b.isToday ? -1 : rank[b.urgency];
        return rA - rB;
      });
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
  }, [notices, selectedCategory, searchQuery, onlyToday, onlyUrgent, onlyStarred, sortBy, todayStr]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        urgentCount={urgentCount}
        todayCount={todayNotices.length}
        onOpenIntake={() => setIsIntakeOpen(true)}
        onOpenDigest={handleOpenDigest}
        isDigestLoading={isDigestLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Today's Immediate Attention Alert Banner (if any) */}
        {todayNotices.length > 0 && !onlyToday && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-rose-950/70 via-rose-900/30 to-slate-950 border border-rose-800/60 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 block">
                  Action Required Today
                </span>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  {todayNotices[0].title}
                  {todayNotices[0].time ? ` — due ${todayNotices[0].time}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setOnlyToday(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
              >
                View Today ({todayNotices.length})
              </button>
            </div>
          </div>
        )}

        {/* Filter & Controls Bar */}
        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onlyToday={onlyToday}
          onToggleOnlyToday={() => setOnlyToday(!onlyToday)}
          onlyUrgent={onlyUrgent}
          onToggleOnlyUrgent={() => setOnlyUrgent(!onlyUrgent)}
          onlyStarred={onlyStarred}
          onToggleOnlyStarred={() => setOnlyStarred(!onlyStarred)}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFiltered={filteredNotices.length}
          onResetDemo={handleResetDemo}
        />

        {/* Notice Items View */}
        {filteredNotices.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredNotices.map((notice) => (
                <NoticeCard
                  key={notice.id}
                  notice={notice}
                  onToggleStar={handleToggleStar}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteNotice}
                  onOpenDetails={(n) => setSelectedNotice(n)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredNotices.map((notice) => (
                <NoticeTimelineItem
                  key={notice.id}
                  notice={notice}
                  onToggleStar={handleToggleStar}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteNotice}
                  onOpenDetails={(n) => setSelectedNotice(n)}
                />
              ))}
            </div>
          )
        ) : (
          /* Empty State */
          <div className="py-16 text-center max-w-md mx-auto p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FilterX className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              No matching announcements
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              No notices match your current filters or search term. Try resetting your search or paste a new forwarded notice.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setOnlyToday(false);
                  setOnlyUrgent(false);
                  setOnlyStarred(false);
                }}
                className="px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setIsIntakeOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Paste Notice</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Campus Pulse — College Life Notice & Deadline Aggregator</span>
          <span className="font-mono text-[11px] text-slate-400">Powered by Gemini AI 3.8 Flash</span>
        </div>
      </footer>

      {/* Modals */}
      <SmartNoticeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onAddNotice={handleAddNotice}
      />

      <WeeklyDigestModal
        isOpen={isDigestOpen}
        onClose={() => setIsDigestOpen(false)}
        digest={weeklyDigest}
        isLoading={isDigestLoading}
        onRefreshDigest={fetchWeeklyDigest}
        notices={notices}
      />

      <NoticeDetailsModal
        notice={selectedNotice}
        isOpen={!!selectedNotice}
        onClose={() => setSelectedNotice(null)}
        onUpdateNotice={handleUpdateNotice}
        onDeleteNotice={handleDeleteNotice}
        onToggleStar={handleToggleStar}
        onToggleComplete={handleToggleComplete}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs shadow-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
