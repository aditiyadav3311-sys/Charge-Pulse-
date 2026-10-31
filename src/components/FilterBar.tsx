import React from 'react';
import { Search, X, Star, AlertCircle, Clock, Calendar, LayoutGrid, List, RefreshCw } from 'lucide-react';
import { NoticeCategory } from '../types/notice';

interface FilterBarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onlyToday: boolean;
  onToggleOnlyToday: () => void;
  onlyUrgent: boolean;
  onToggleOnlyUrgent: () => void;
  onlyStarred: boolean;
  onToggleOnlyStarred: () => void;
  sortBy: 'date' | 'urgency' | 'newest';
  onSortChange: (sort: 'date' | 'urgency' | 'newest') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  totalFiltered: number;
  onResetDemo: () => void;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All Items', value: 'all' },
  { label: 'Academic', value: 'Academic' },
  { label: 'Events & Fests', value: 'Events' },
  { label: 'Clubs', value: 'Clubs' },
  { label: 'Placements', value: 'Placement' },
  { label: 'General', value: 'General' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onlyToday,
  onToggleOnlyToday,
  onlyUrgent,
  onToggleOnlyUrgent,
  onlyStarred,
  onToggleOnlyStarred,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalFiltered,
  onResetDemo,
}) => {
  return (
    <div className="space-y-3.5 mb-6">
      
      {/* Top Search & Fast Toggles Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notices, exams, clubs, venues, or keywords..."
            className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-lg bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Priority Toggles & Sort Options */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Due Today Quick Toggle */}
          <button
            onClick={onToggleOnlyToday}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
              onlyToday
                ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Today Only</span>
          </button>

          {/* Urgent Quick Toggle */}
          <button
            onClick={onToggleOnlyUrgent}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
              onlyUrgent
                ? 'bg-amber-950/60 border-amber-600 text-amber-200'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Urgent</span>
          </button>

          {/* Starred Quick Toggle */}
          <button
            onClick={onToggleOnlyStarred}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
              onlyStarred
                ? 'bg-indigo-950/60 border-indigo-600 text-indigo-200'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyStarred ? 'fill-indigo-300' : ''}`} />
            <span>Starred</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider hidden lg:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="date">Date (Earliest First)</option>
              <option value="urgency">Urgency Priority</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Compact Timeline View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Category Segmented Bar & Stats Count */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
        {/* Category Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onSelectCategory(cat.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Counter & Reset Action */}
        <div className="flex items-center gap-3 shrink-0 text-xs text-slate-400">
          <span className="font-mono tabular-nums">
            {totalFiltered} {totalFiltered === 1 ? 'item' : 'items'}
          </span>
          <button
            onClick={onResetDemo}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
            title="Reset to fresh demo sample notices"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>

    </div>
  );
};
