export type NoticeCategory = 'Academic' | 'Events' | 'Clubs' | 'Placement' | 'General';

export type NoticeUrgency = 'urgent' | 'upcoming' | 'expired';

export interface CampusNotice {
  id: string;
  title: string;
  category: NoticeCategory;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "10:30 AM - 1:00 PM"
  venue?: string; // e.g. "Main Auditorium"
  summary: string; // 1-2 sentence core requirement
  rawSourceText?: string; // original pasted snippet
  urgency: NoticeUrgency;
  isToday?: boolean;
  isStarred?: boolean;
  isCompleted?: boolean;
  actionUrl?: string; // registration link or portal
  organizer?: string; // Club/Department
  createdAt: number;
}

export interface WeeklyDigestData {
  headline: string;
  summary: string;
  criticalDeadlines: string[];
  campusHighlights: string[];
  studentTip: string;
  generatedAt: string;
}

export interface ExtractedNoticeResponse {
  title: string;
  category: NoticeCategory;
  date: string;
  time?: string;
  venue?: string;
  summary: string;
  urgency: NoticeUrgency;
  actionUrl?: string;
  organizer?: string;
}
