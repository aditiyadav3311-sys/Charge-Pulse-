import { CampusNotice } from '../types/notice';

function getRelativeDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const INITIAL_NOTICES: CampusNotice[] = [
  {
    id: 'notice-1',
    title: 'CS402 Operating Systems Lab Project Submission',
    category: 'Academic',
    date: getRelativeDate(0), // Today!
    time: '11:59 PM Tonight',
    venue: 'Department LMS Portal',
    summary: 'Final submission of kernel synchronization module with GitHub repo link and design document. No extensions granted.',
    urgency: 'urgent',
    isToday: true,
    isStarred: true,
    actionUrl: 'https://lms.university.edu/course/cs402/submit',
    organizer: 'Dept. of Computer Science (Prof. Miller)',
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'notice-2',
    title: 'Google & Amazon Summer 2026 SDE Internship Drive',
    category: 'Placement',
    date: getRelativeDate(1), // Tomorrow
    time: '10:00 AM - 1:30 PM',
    venue: 'Main Auditorium (Audi 1)',
    summary: 'Pre-placement presentation followed by live coding round. Mandatory business formal attire and 2 printed resumes required.',
    urgency: 'urgent',
    isToday: false,
    isStarred: true,
    actionUrl: 'https://placement.campus.edu/drives/summer2026',
    organizer: 'Central Training & Placement Cell',
    createdAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'notice-3',
    title: 'HackPulse 2026: 36-Hour National Student Hackathon',
    category: 'Events',
    date: getRelativeDate(3),
    time: '9:00 AM Check-in',
    venue: 'Innovation & Maker Space Lab',
    summary: 'Build with Gemini AI, IoT, or Web3 tracks. $10,000 cash prize pool, cloud credits, and on-spot startup incubator interviews.',
    urgency: 'upcoming',
    isToday: false,
    isStarred: false,
    actionUrl: 'https://hackpulse.dev/register',
    organizer: 'Developer Student Club & E-Cell',
    createdAt: Date.now() - 3600000 * 24,
  },
  {
    id: 'notice-4',
    title: 'Music & Cultural Society Annual Auditions',
    category: 'Clubs',
    date: getRelativeDate(4),
    time: '4:30 PM - 7:00 PM',
    venue: 'Student Activity Center (SAC Hall 2)',
    summary: 'Open call for vocalists, instrumentalists, sound engineers, and event coordinators for the upcoming Spring Fest concert.',
    urgency: 'upcoming',
    isToday: false,
    isStarred: false,
    actionUrl: 'https://campus-arts.org/auditions',
    organizer: 'Campus Cultural Committee',
    createdAt: Date.now() - 3600000 * 30,
  },
  {
    id: 'notice-5',
    title: 'Campus Marathon & Inter-Department Sports Trophy',
    category: 'Events',
    date: getRelativeDate(6),
    time: '6:30 AM - 11:00 AM',
    venue: 'University Sports Complex',
    summary: '5K morning run followed by 7-a-side football and basketball playoffs. T-shirts and breakfast provided to all registered runners.',
    urgency: 'upcoming',
    isToday: false,
    isStarred: false,
    actionUrl: 'https://sports.campus.edu/marathon',
    organizer: 'Department of Physical Education',
    createdAt: Date.now() - 3600000 * 48,
  },
];

export interface SampleMessyNotice {
  id: string;
  label: string;
  categoryTag: string;
  sourceText: string;
}

export const SAMPLE_RAW_NOTICES: SampleMessyNotice[] = [
  {
    id: 'sample-exam',
    label: 'Forwarded Exam Alert',
    categoryTag: 'Academic',
    sourceText: `*ATTENTION ALL 3RD YEAR CSE STUDENTS!* 🚨🚨
Due to the guest lecture yesterday, your CS304 Database Management Systems Midterm Lab Exam is rescheduled to tomorrow at 9:30 AM sharp in Lab 304 (Tech Building 3rd Floor).
Bring your printed lab journals and college ID cards. Anyone arriving past 9:45 AM will not be allowed. Also remember to push your SQL trigger code to GitHub by tonight 11:59 PM.
— Dr. Arvind Sharma (HOD CSE)`,
  },
  {
    id: 'sample-placement',
    label: 'WhatsApp Placement Forward',
    categoryTag: 'Placement',
    sourceText: `Fwd from TPO WhatsApp:
URGENT: Shortlisted candidates for Microsoft Summer Tech Internship must report to Central Seminar Hall tomorrow at 2:00 PM for the offline technical interview and HR round.
Dress code strictly formal. Bring 3 hard copies of resume and your portfolio link.
Portal registration link to verify roll number: https://placement.university.edu/msft-round2
Do not be late!`,
  },
  {
    id: 'sample-hackathon',
    label: 'Club Hackathon Poster Caption',
    categoryTag: 'Events',
    sourceText: `🚀 READY TO BUILD THE FUTURE?
GDSC Campus Chapter presents *BuildNova 2026* — our flagship 24-hr offline AI hackathon!
📅 Date: This Friday starting at 5:00 PM
📍 Venue: Turing Computing Center & Robotics Lab
🔥 Tracks: Generative AI, Campus Mobility, FinTech
Prizes worth $5,000 + Google swag for top 10 teams! Free dinner and midnight energy drinks included.
Sign up your team of 2-4 members here before Thursday midnight: https://buildnova.org/register`,
  },
  {
    id: 'sample-club',
    label: 'Dance & Drama Club Notice',
    categoryTag: 'Clubs',
    sourceText: `Hey everyone!! 🎭✨
The Dramatics and Street Play Society (Natak Mandali) is hosting auditions for the Annual Inter-College Fest next Monday, Nov 10th at 4:30 PM in the Amphitheatre behind the library.
No prior acting experience needed! Just bring your energy and creativity.
RSVP your audition slot here: https://forms.gle/actingauditions2026
See you on stage! 🔥`,
  },
];
