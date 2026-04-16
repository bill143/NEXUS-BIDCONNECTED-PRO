# Nexus BidConnected Pro — Bid Security Tracking

Construction bid security tracking, bond lifecycle management, and compliance dashboard. Designed as a compliance module for ON Bid Manager.

## Features

- **Bond Lifecycle Tracking** — Full lifecycle management for bid bonds, performance bonds, and payment bonds (draft → issued → active → expiring → renewed/released/forfeited)
- **Central Dashboard** — KPI cards, expiration timeline, status distribution, compliance health score, and recent activity feed
- **Automated Renewal Reminders** — Auto-generated reminders at 60/30/14/7/1 days before bond expiration with priority levels
- **Project Management** — Track construction projects with associated bonds, estimated values, and bid deadlines
- **Status Transition Engine** — Enforced state machine with full audit trail of every status change
- **Compliance Score** — Real-time compliance health indicator based on bond renewal status

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript** throughout
- **Tailwind CSS** for styling
- **Prisma ORM** with SQLite
- **date-fns** for date operations

## Getting Started

```bash
npm install
cp .env.example .env
npx prisma db push
npx tsx prisma/seed.ts   # Load sample data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Bond Status Lifecycle

```
draft → issued → active → expiring → renewed → active (cycle)
                    ↓          ↓
                 released   expired
                    ↓
                forfeited
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/dashboard` | Aggregated dashboard statistics |
| GET/POST | `/api/projects` | List/create projects |
| GET/PUT/DELETE | `/api/projects/[id]` | Single project operations |
| GET/POST | `/api/bonds` | List/create bonds |
| GET/PUT/DELETE | `/api/bonds/[id]` | Single bond operations |
| POST | `/api/bonds/[id]/transitions` | Execute bond status transition |
| GET/PATCH | `/api/reminders` | List/update reminders |
| POST | `/api/reminders/process` | Process automated reminders & auto-transitions |
