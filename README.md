# TalentTrade – A Freelance & Skill Exchange Platform

TalentTrade is a modern, full-stack freelance marketplace that combines conventional monetary contracts with peer-to-peer **Skill Barter** (zero-cash talent exchange).

---

## 1. Demo Credentials (For Evaluation)

The platform is pre-seeded with populated accounts, services, active workspaces, and reviews:

| Role | Email | Password | Quick Switcher |
| :--- | :--- | :--- | :--- |
| **Freelancer** | `freelancer@talenttrade.demo` | `Demo@123` | Click **"Demo Switcher"** → *Freelancer (Priya)* |
| **Client** | `client@talenttrade.demo` | `Demo@123` | Click **"Demo Switcher"** → *Client (Marcus)* |
| **Admin** | `admin@talenttrade.demo` | `Admin@123` | Click **"Demo Switcher"** → *Admin Console* |

---

## 2. Core Features & Flows Implemented

1. **Dual Service Modes**:
   - **PAID SERVICE**: Conventional freelance hiring with simulated escrow and payment simulation (UPI, Card, Wallet).
   - **SKILL EXCHANGE**: Direct peer-to-peer barter (e.g. Machine Learning in exchange for UI/UX Design) with reciprocal task tracking and zero cash spent.
2. **Profile System**:
   - Full identity with bio, hourly rate, availability, verified skills with 4 proficiency levels (`Beginner`, `Intermediate`, `Advanced`, `Expert`), education, experience, and certifications.
3. **Gig & Service Marketplace**:
   - Freelancer "Offer a Service" creator with category, skills, pricing, and sample work.
   - Comprehensive multi-filter directory: category, skill, price range, delivery timeframe, and rating.
4. **Project Proposals & Workspace**:
   - Clients post open briefs (Paid or Skill Barter).
   - Freelancers submit proposals with custom cover letters and price bids.
   - Client acceptance automatically provisions an interactive **Project Workspace**.
5. **Project Workspace Collaboration**:
   - **Interactive Chat**: Real-time project discussion with timestamps and file sharing.
   - **Tasks & Milestones**: Interactive status changes (`Pending` → `In Progress` → `Completed`) dynamically updating overall project progress.
   - **Deliverables Submission & Review**: Freelancer submits work version archives with deployment notes; Client reviews to either **Accept Work** or **Request Revisions**.
   - **Simulated Payment Gateway**: On acceptance of paid contracts, client triggers instant simulated payment via UPI, Credit Card, or Escrow Wallet with transaction receipts.
   - **Skill Exchange Completion**: Barter projects complete upon deliverable sign-off.
6. **Ratings & Reviews**:
   - Both parties submit 5-star ratings and textual reviews that immediately update public user profiles.
7. **Portfolio Integration**:
   - Accepted projects can be added to the freelancer's portfolio with 1 click.
8. **Dispute & Report Center**:
   - Users file reports on fake profiles, fraud, or project disputes.
   - Admin moderation console investigates reports, updates status, and issues resolution notes.
9. **Admin Dashboard**:
   - Real-time analytics, user distribution, service moderation, dispute investigation, and transaction ledgers.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, React Router, Lucide Icons
- **Backend**: Node.js, Express REST API, JSON Web Tokens (JWT), bcryptjs password hashing
- **Database**:
  - Structured schemas for MongoDB collections (`User`, `Service`, `Project`, `Proposal`, `ExchangeRequest`, `Message`, `Notification`, `Review`, `Report`, `Payment`, `Wishlist`).
  - Active persistence layer in `./data/db.json` ensuring seamless local development without external setup hurdles.

---

## 4. API Endpoints

- `POST /api/auth/register` – Register new user
- `POST /api/auth/login` – Sign in
- `POST /api/auth/demo-login` – 1-click evaluator login
- `GET /api/auth/me` – Current session profile
- `GET /api/services` – List & filter service gigs
- `POST /api/services` – Publish service
- `GET /api/users/freelancers` – Filter talent directory
- `PUT /api/users/profile` – Update profile details
- `POST /api/users/profile/skills` – Add skill & proficiency
- `GET /api/projects` – List projects
- `POST /api/projects` – Post new brief
- `POST /api/proposals` – Apply to project
- `PATCH /api/proposals/:id/accept` – Accept proposal & launch workspace
- `POST /api/exchange` – Propose skill barter
- `PATCH /api/exchange/:id/accept` – Accept barter & provision workspace
- `GET /api/workspace/:projectId/messages` – Workspace chat
- `POST /api/workspace/:projectId/messages` – Send message
- `POST /api/workspace/:projectId/submit-work` – Submit deliverable
- `POST /api/workspace/:projectId/review-work` – Accept or request revision
- `POST /api/payments/demo` – Simulated escrow transaction
- `POST /api/reviews` – Submit star rating & feedback
- `POST /api/reports` – File dispute

---

## 5. MongoDB Connection Instructions

To connect an external MongoDB database:
1. Provide your connection string in `.env`:
   ```bash
   MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/talenttrade?retryWrites=true&w=majority"
   ```
2. The data models defined in `/server/types.ts` map directly 1:1 to Mongoose documents.
