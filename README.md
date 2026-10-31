# Campus Pulse 🎓⚡
> **AI-Powered Campus Life Notice & Deadline Intelligence Workspace**

Built for the competitive AI Buildathon.

---

## 📌 Problem & Solution
Students face daily friction: scattered notices in WhatsApp groups, missed exam submissions, forgotten internship drives, and cluttered college emails.

**Campus Pulse** provides a single intelligent command center:
1. **Smart AI Intake**: Paste raw, unstructured WhatsApp messages, forwarded circulars, or poster captions. Gemini 3.8 Flash extracts the title, category, date, time, venue, action links, and priority score into a clean structured card.
2. **Organized Dashboard**: Real-time category filtering (Academic, Events, Clubs, Placement), full-text search, and multi-view switcher (Card Grid & Chronological Timeline).
3. **Priority & Urgency Tracking**: Automatically flags items as **Needs Attention Today**, **Urgent (< 48h)**, or **Upcoming**, with Google Calendar 1-click sync and `.ics` download for Apple/Outlook Calendar.
4. **"What Do I Need To Know This Week?" AI Digest**: One-click weekly executive briefing synthesizing all active deadlines, campus highlights, and student tips.
5. **Zero-Crash Resilience**: Resilient dual-engine architecture — server-side Gemini 3.8 Flash with a client-side heuristic NLP fallback so the application works seamlessly under any network or offline conditions.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, Tailwind CSS v4, Motion, Lucide Icons
- **Backend / AI**: Express, Node.js (`tsx`), `@google/genai` SDK (`gemini-3.8-flash`)
- **Calendar**: RFC 5545 `.ics` iCalendar export & Google Calendar URL generator
- **Persistence**: Browser `localStorage` with pre-seeded demo notices

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🌐 Deploy to Vercel or Cloud Run
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Start Command**: `node server.ts` or `npm start`
- **Environment Variables**: Add `GEMINI_API_KEY` in your Vercel / Cloud Run project settings.
