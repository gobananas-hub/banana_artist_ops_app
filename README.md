# Banana Artist Launch OS — MVP Prototype

Web app prototype for Banana Sound Studio's **Artist Launch 60K** business model.

## What is included

- Client-facing Artist Launch landing + package explanation
- 3-step artist intake form
- Project status tracking by Project Code
- Studio Ops dashboard
- Sales pipeline + new lead capture
- Project Kanban (Queue / Doing / Review / Done)
- Owner filtering (Sales / Creative / Production / Post-PM)
- 60,000 THB unit economics
- Job Fee / Growth Fund / Company Contribution calculator
- Break-even calculator
- Core policies: 50% deposit, 2 demo revisions, 3-hour vocal session, approval gate, add-ons, paid job fee
- Browser `localStorage` persistence for demo data
- Responsive desktop / tablet / mobile UI

## Run locally

Option 1: Double-click `index.html`.

Option 2 (recommended):

```bash
cd banana_artist_ops_app
python3 -m http.server 8080
```

Then open: http://localhost:8080

## Prototype limitations

This is an MVP frontend prototype. It does not yet include real authentication, cloud database, file upload/storage, online payment, calendar booking, email/LINE notifications, streaming distributor API, or permissions.

## Recommended production stack

- Frontend: Next.js / React
- Database & auth: Supabase or Firebase
- File storage: Supabase Storage / Cloudflare R2
- Payment: Opn (Omise) or Stripe where applicable
- Scheduling: Google Calendar
- Notifications: LINE OA + email
- Analytics: PostHog / GA4
- Deployment: Vercel

## Suggested roles

- Sales — ทีมจุ๊
- Creative — ทีมเอส
- Production — ทีมหนึ่ง + Producer Pool
- Delivery — Post / PM
- Admin — Management / Finance
