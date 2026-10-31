import { ExtractedNoticeResponse, NoticeCategory, NoticeUrgency } from '../types/notice';

// Intelligent client-side heuristic parser for instant fallback
export function parseNoticeLocally(text: string): ExtractedNoticeResponse {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // 1. Detect Category
  let category: NoticeCategory = 'General';
  if (/exam|midterm|quiz|assignment|submission|syllabus|lecture|class|hod|professor|grade|attendance|lab/i.test(clean)) {
    category = 'Academic';
  } else if (/placement|internship|hiring|job|ctc|interview|shortlist|drive|resume|recruitment|company/i.test(clean)) {
    category = 'Placement';
  } else if (/fest|hackathon|cultural|concert|dj|dance|music|drama|night|carnival|summit|workshop/i.test(clean)) {
    category = 'Events';
  } else if (/club|gdsc|ieee|rotaract|ecell|audition|member|core team|society|meeting/i.test(clean)) {
    category = 'Clubs';
  }

  // 2. Extract Title
  const lines = clean.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let title = 'Campus Notice';
  for (const line of lines) {
    const stripped = line.replace(/[*_#~]/g, '').trim();
    if (stripped.length > 5 && stripped.length < 80 && !stripped.toLowerCase().startsWith('http')) {
      title = stripped;
      break;
    }
  }

  // 3. Extract Venue
  let venue = 'Campus Main Ground';
  const venueMatch = clean.match(/(?:venue|location|place|at|in|audi|hall|room|lab)\s*[:\-]?\s*([A-Za-z0-9\s,\-]+(?:\b(?:hall|audi|auditorium|ground|lab|room|center|block|floor|seminar|campus)\b|[A-Za-z0-9\s]{3,25}))/i);
  if (venueMatch && venueMatch[1]) {
    venue = venueMatch[1].trim().replace(/[.,]$/, '');
  } else if (/zoom|google meet|teams|online/i.test(clean)) {
    venue = 'Online (Virtual)';
  }

  // 4. Extract Time
  let time = '10:00 AM';
  const timeMatch = clean.match(/(\b\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)\b(?:\s*[-–to]+\s*\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)\b)?)/);
  if (timeMatch && timeMatch[1]) {
    time = timeMatch[1].trim();
  } else if (/midnight|11:59/i.test(clean)) {
    time = '11:59 PM';
  }

  // 5. Extract URL
  let actionUrl = '';
  const urlMatch = clean.match(/(https?:\/\/[^\s<>"{}|\\^`]+)/i);
  if (urlMatch && urlMatch[1]) {
    actionUrl = urlMatch[1];
  }

  // 6. Extract Date & Calculate Urgency
  const today = new Date();
  let targetDate = new Date();
  let urgency: NoticeUrgency = 'upcoming';

  if (/today|tonight/i.test(clean)) {
    targetDate = new Date();
    urgency = 'urgent';
  } else if (/tomorrow|tmrw|tmr/i.test(clean)) {
    targetDate.setDate(today.getDate() + 1);
    urgency = 'urgent';
  } else if (/day after tomorrow/i.test(clean)) {
    targetDate.setDate(today.getDate() + 2);
    urgency = 'urgent';
  } else {
    // Check for explicit dates like "15 Nov", "Nov 15", "15/11", "2026-11-05"
    const isoDateMatch = clean.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
    const monthDayMatch = clean.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i) ||
                          clean.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?\b/i);

    if (isoDateMatch) {
      targetDate = new Date(isoDateMatch[1]);
    } else if (monthDayMatch) {
      // Approximate date in upcoming days
      targetDate.setDate(today.getDate() + 3);
    } else {
      // Default to 2 days ahead
      targetDate.setDate(today.getDate() + 2);
    }
  }

  // Check diff days
  const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    urgency = 'expired';
  } else if (diffDays <= 2) {
    urgency = 'urgent';
  } else {
    urgency = 'upcoming';
  }

  const dateString = targetDate.toISOString().split('T')[0];

  // 7. Extract Summary
  const summary = lines.find(l => l.length > 25 && l !== title) ||
    clean.slice(0, 140).replace(/\n/g, ' ') + '...';

  return {
    title: title.length > 60 ? title.slice(0, 57) + '...' : title,
    category,
    date: dateString,
    time,
    venue,
    summary,
    urgency,
    actionUrl,
    organizer: category === 'Academic' ? 'Department Academic Office' : category === 'Placement' ? 'Training & Placement Cell' : 'Student Activities Council',
  };
}
