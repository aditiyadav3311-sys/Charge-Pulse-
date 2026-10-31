import { CampusNotice } from '../types/notice';

// Helper to format date string to iCal format YYYYMMDDTHHMMSSZ or YYYYMMDD
export function formatIcsDate(dateStr: string, timeStr?: string): string {
  // If dateStr is YYYY-MM-DD
  const cleanDate = dateStr.replace(/-/g, '');
  if (!timeStr) {
    return cleanDate;
  }
  // If time is provided, approximate time
  return `${cleanDate}T090000Z`;
}

// Generate Google Calendar Link
export function getGoogleCalendarUrl(notice: CampusNotice): string {
  const title = encodeURIComponent(notice.title);
  const details = encodeURIComponent(
    `${notice.summary}\n\nVenue: ${notice.venue || 'Campus'}\nCategory: ${notice.category}\nOrganized by: ${notice.organizer || 'Campus'}${
      notice.actionUrl ? `\nLink: ${notice.actionUrl}` : ''
    }\n\nOrganized via Campus Pulse`
  );
  const location = encodeURIComponent(notice.venue || 'Campus');

  // Format dates: YYYYMMDD
  const dateFormatted = notice.date.replace(/-/g, '');
  const dates = `${dateFormatted}/${dateFormatted}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
}

// Generate and trigger download of .ics file
export function downloadIcsFile(notice: CampusNotice): void {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const cleanDate = notice.date.replace(/-/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campus Pulse//College Life Intelligence//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:pulse-${notice.id}@campuspulse.edu`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${cleanDate}`,
    `DTEND;VALUE=DATE:${cleanDate}`,
    `SUMMARY:${notice.title.replace(/[,;]/g, ' ')}`,
    `DESCRIPTION:${(notice.summary + (notice.actionUrl ? ` Link: ${notice.actionUrl}` : '')).replace(/\n/g, '\\n')}`,
    `LOCATION:${(notice.venue || 'Campus').replace(/[,;]/g, ' ')}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${notice.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
