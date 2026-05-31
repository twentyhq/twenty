# TOFU CRM — Client Customization Playbook

> This is the definitive checklist for everything we evaluate, configure, and customize when setting up a new Twenty CRM instance for a client. Work through each section in order on every deployment.

---

## How Customization Works in Twenty

There are **two layers** of customization:

| Layer | What it covers | How to change |
|---|---|---|
| **UI / Settings** | Logo, workspace name, data model, pipelines, users, API keys | In-app Settings — no code required |
| **Fork-level** | Default branding fallbacks, default objects seeded at workspace creation, email templates, auth pages | Code changes in this repo |

For most clients, UI settings are sufficient. Fork-level changes are for things that need to be the same across every deployment (TOFU defaults) or things not yet exposed in the UI.

---

## Section 1 — Branding

### 1.1 Workspace Logo ⭐ (do this FIRST)

**What it affects:** The logo shown on the sign-in/sign-up page ("Welcome to your workspace"), inside the app nav drawer, and in email notifications.

**How it works technically:** `workspace.logo` is stored in the DB as a file reference. When no logo is set, the app falls back to the neutral fork default (`/branding/default-app-icon.svg`). See `tofu/BRANDING.md` for the complete asset replacement map. Once you upload a logo, it's served from `SERVER_URL/files/...` and the server dynamically injects it into favicons, PWA manifest, and HTML.

**Steps:**
1. Log in as workspace admin
2. Go to **Settings → General**
3. Click the logo area → upload client's logo (PNG or SVG, square preferred, min 192×192px)
4. Save

**For TOFU sandbox (localhost):** Upload the TOFU logo first so you see it on every login screen.

**Logo sourcing checklist for new clients:**
- [ ] Get logo file from client (prefer SVG or 512×512 PNG, transparent background)
- [ ] Upload to Settings → General → Logo on their instance
- [ ] Confirm it appears on the sign-in page and inside the nav drawer
- [ ] Upload same logo as the workspace avatar (the small circular one in the top-left nav)

### 1.2 Workspace Name

**Settings → General → Workspace name**

Set this to the client's company name (e.g., "Acme Corp CRM"). This appears in:
- Browser tab title
- Email subjects ("You've been invited to join **Acme Corp CRM**")
- The top of the nav drawer

### 1.3 Favicon & PWA ("Open in app" icon)

Handled by fork + workspace logo upload — **no per-client image build required.**

| What | How |
|---|---|
| Browser tab icon | `/favicon.ico` on server → redirects to workspace logo |
| Install / Open in app | Server-side `/manifest.json` (workspace-branding.middleware) — works even on fresh loads and for install prompts |
| Slack / link previews | Server injects `og:image` + workspace title in HTML |

**Steps:** Upload logo in Settings → General (Section 1.1). After deploy or logo change, remove and re-install the PWA on mobile.

**Verify:** See [WHITE-LABEL.md](./WHITE-LABEL.md#verify-white-label-run-after-every-image-rollout).

### 1.4 Email Sender Name

When Twenty sends invite or notification emails, the sender name defaults to "Twenty".

**Settings → General → Support chat** (look for email config)

Also controlled by env vars:
```env
EMAIL_FROM_ADDRESS=crm@clientdomain.com
EMAIL_FROM_NAME="Acme Corp CRM"
```

Set these per-client in their deployment env vars.

---

## Section 2 — Data Model

> This is the most important customization. Every client has a different definition of "customer."

### 2.1 Built-in Objects (review with client)

Twenty ships with these standard objects:
- **People** — individual contacts
- **Companies** — organizations
- **Opportunities** — deals/pipeline items
- **Notes** — freeform notes linked to any record
- **Tasks** — to-dos linked to records
- **Messages** — email/calendar sync (requires Gmail/Outlook integration)

**Questions to ask every client:**
- Do "People" and "Companies" map to their contact model or do they need renaming?
- Do they use "Opportunities" for deals, or is their pipeline something else (Projects, Cases, Engagements)?
- What fields are missing from each object?

### 2.2 Custom Objects

**Settings → Data model → + Add object**

Common custom objects for TOFU client types:

| Client type | Likely custom objects |
|---|---|
| Agency / Consulting | Projects, Deliverables, Contracts, Invoices |
| SaaS | Subscriptions, Feature Requests, Support Tickets |
| Real estate | Properties, Listings, Showings |
| Legal | Cases, Matters, Billing Entries |
| Recruiting | Job Openings, Applications, Interviews |

**For each custom object, define:**
- Singular / Plural name (e.g., "Project" / "Projects")
- Icon (pick from the Tabler icon set)
- Key fields (text, number, date, select, relation to other objects)
- Relations to built-in objects (e.g., Project → Company, Project → People)

### 2.3 Custom Fields on Built-in Objects

**Settings → Data model → [Object name] → + Add field**

Common additions to standard objects:
- People: LinkedIn URL, Lead Source, Lead Status, Persona/ICP tier
- Companies: Industry, ARR, Employee count, ICP score, Account owner
- Opportunities: Close date, Deal size, Stage, Loss reason, Next step

### 2.4 Renaming / Hiding Standard Objects

If a client doesn't use "Opportunities" at all, you can:
- Rename it: Settings → Data model → Opportunities → edit name
- Hide it from nav: Settings → Objects → toggle visibility

---

## Section 3 — Views & Pipelines

### 3.1 Default Views

Each object has default Table and List views. Customize for every client:

**Settings → [Object] → Views**

- Reorder columns to show what matters (e.g., Company + Deal size + Close date + Owner for Opportunities)
- Set default sort (e.g., Close date ascending for pipeline)
- Save as the workspace default so every new user sees the right thing out of the box

### 3.2 Kanban Pipeline Stages

For Opportunities (or any select field), the Kanban view is driven by a **select field with stages**.

**How to edit stages:**
1. Settings → Data model → Opportunities → Stage field
2. Edit options: rename, reorder, set colors, add/remove stages

**Default stages:**
`New → Screening → Meeting → Proposal → Customer → Churned`

**Customize per client type:**

| Client type | Suggested pipeline stages |
|---|---|
| Agency sales | Lead → Discovery → Proposal → Negotiation → Won → Lost |
| SaaS | Trial → Activated → Expansion → Renewal → Churned |
| Consulting | Prospect → Scoping → Proposal → Signed → Active → Complete |
| Real estate | Lead → Viewing → Offer → Under Contract → Closed |

### 3.3 Filters & Grouping

Pre-configure saved views with filters the client will use daily:
- "My open deals" (filter: Owner = me, Stage ≠ Won/Lost)
- "This month's closes" (filter: Close date = this month)
- "Hot leads" (filter: ICP score = High, Stage = early)

---

## Section 4 — Auth & Users

### 4.1 Auth Method

**Settings → Security**

Options:
- **Email/password** — default, works out of the box
- **Google OAuth** — requires `AUTH_GOOGLE_*` env vars; highly recommended if client uses Google Workspace
- **Microsoft OAuth** — requires `AUTH_MICROSOFT_*` env vars; for Microsoft 365 shops
- **SSO (SAML)** — enterprise only (Twenty Organization plan required); for clients with Okta/Azure AD

**Recommendation:** enable Google OAuth for every client using Google Workspace. Reduces support overhead dramatically (no password resets).

### 4.2 Inviting Users

**Settings → Members → Invite**

Two invite modes:
- **Email invite** — sends a link; user creates their own password
- **Invite link** — share a URL; anyone with the link can join (good for onboarding a team at once)

**Workspace creation restriction:** set `IS_WORKSPACE_CREATION_LIMITED_TO_SERVER_ADMINS=true` in env vars so only TOFU admins can spin up new workspaces on a shared instance.

### 4.3 Roles & Permissions

**Settings → Roles**

Built-in roles:
- **Admin** — full access including Settings and Data model
- **Member** — can CRUD records, cannot change data model or settings
- **Guest** — read-only (limited)

**For most clients:**
- TOFU gets Admin
- Client power user gets Admin
- Regular team members get Member
- External stakeholders / read-only users get Guest

### 4.4 Sign-in Prefilled (dev/sandbox only)

The env var `SIGN_IN_PREFILLED=true` pre-fills the login form with demo credentials. **Disable this in any client-facing instance:**
```env
SIGN_IN_PREFILLED=false
```

---

## Section 5 — API & Integrations

### 5.1 API Keys

**Settings → API → Generate API key**

Generate a key for:
- TOFU's internal tooling / data pipelines
- Any client-specific integrations they want to build
- Zapier / Make / n8n connectors

Twenty's API is **GraphQL**. Playground: `https://crm.clientname.com/api`

### 5.2 Webhooks

**Settings → API → Webhooks → + Add webhook**

Configure webhooks to push events to:
- Slack (new deal won, new contact added)
- Internal dashboards
- Billing systems on deal close

Supported events: record created, updated, deleted — per object type.

### 5.3 Gmail / Google Calendar Integration

**Settings → Accounts → + Connect**

Per-user integration. Each team member connects their own Google account. Once connected:
- Emails to/from contacts auto-appear on their record timeline
- Calendar events linked to contacts/companies

Requires these env vars on the instance:
```env
MESSAGING_PROVIDER_GMAIL_ENABLED=true
CALENDAR_PROVIDER_GOOGLE_ENABLED=true
AUTH_GOOGLE_CLIENT_ID=...
AUTH_GOOGLE_CLIENT_SECRET=...
AUTH_GOOGLE_CALLBACK_URL=https://crm.clientname.com/auth/google/redirect
AUTH_GOOGLE_APIS_CALLBACK_URL=https://crm.clientname.com/auth/google-apis/get-access-token
```

### 5.4 Microsoft / Outlook Integration

Same pattern as Google but for Microsoft 365 clients:
```env
MESSAGING_PROVIDER_MICROSOFT_ENABLED=true
CALENDAR_PROVIDER_MICROSOFT_ENABLED=true
AUTH_MICROSOFT_ENABLED=true
AUTH_MICROSOFT_CLIENT_ID=...
AUTH_MICROSOFT_CLIENT_SECRET=...
```

---

## Section 6 — Workflows & Automations

**Settings → Workflows** (or the Workflows section in the left nav)

Twenty's built-in automation layer. Trigger → Filter → Action chains, no code required.

### 6.1 What it can do

| Trigger | Example actions |
|---|---|
| Record created | Notify Slack when a new lead is added |
| Record updated | Send email when opportunity stage changes to "Won" |
| Field value changes | Auto-assign owner based on territory |
| Date-based | Remind owner 7 days before close date |

### 6.2 Recommended automations to set up for every client

- [ ] **New lead → Slack notification** to sales channel
- [ ] **Deal won → Slack #wins** with deal size + company name
- [ ] **No activity for 14 days** → task created for owner ("Follow up with [Company]")
- [ ] **New user invited** → welcome email (if not handled by external tool)

### 6.3 Limitations (as of v2.x)

- No branching / conditional logic yet (if/else)
- No loops
- For complex automations, use Webhooks → external tool (Zapier, Make, n8n)

---

## Section 7 — Per-Deployment Env Vars Checklist

Every client deployment needs these configured (see `DEPLOYMENT-DIGITALOCEAN.md` for full provisioning steps):

```env
# Required
APP_SECRET=<openssl rand -base64 32>         # unique per deployment
SERVER_URL=https://crm.clientname.com        # client's actual domain
PG_DATABASE_URL=...                          # Supabase connection string
REDIS_URL=...                                # Upstash connection string
SIGN_IN_PREFILLED=false                      # NEVER true in production

# Branding
EMAIL_FROM_ADDRESS=crm@clientname.com
EMAIL_FROM_NAME="ClientName CRM"

# Auth (enable what the client uses)
AUTH_GOOGLE_ENABLED=true/false
AUTH_MICROSOFT_ENABLED=true/false

# Storage
STORAGE_TYPE=s3
STORAGE_S3_REGION=us-east-1
STORAGE_S3_NAME=twenty-clientname
STORAGE_S3_ENDPOINT=https://<ref>.supabase.co/storage/v1/s3
STORAGE_S3_ACCESS_KEY_ID=...
STORAGE_S3_SECRET_ACCESS_KEY=...
```

---

## Section 8 — Post-Deploy Onboarding Sequence

After the instance is live, run through this with the client in order:

1. **Upload logo** — Settings → General → Logo
2. **Set workspace name** — Settings → General → Name
3. **Configure auth** — enable Google/Microsoft OAuth if applicable
4. **Customize data model** — add custom objects and fields per their use case
5. **Set pipeline stages** — rename Opportunity stages to match their sales process
6. **Configure default views** — set column order and default filters
7. **Invite team** — start with 1-2 power users, have them validate before full rollout
8. **Set up automations** — at minimum: new lead → Slack notification
9. **Connect email/calendar** — each user connects their own Google/Microsoft account
10. **Import existing data** — CSV import via Settings → Import (People and Companies)
11. **Generate API key** — for TOFU's use and any integrations the client needs
12. **Train the client** — 45-min walkthrough: daily workflow, adding records, pipeline view, tasks

---

## Section 9 — What Requires a Fork-Level Code Change

These cannot be done through the UI and require changes to this repo:

| Item | File(s) | Status | Priority |
|---|---|---|---|
| **White-label sign-in logo** — removed Twenty "20" fallback; sign-in page shows workspace logo (uploaded in Settings) or nothing | `Logo.tsx`, `SignInUp.tsx` | ✅ Done | Critical |
| **Favicon / PWA / link previews** — workspace logo via `/favicon.ico`, server HTML inject, dynamic `/manifest.json` | `workspace-branding/*` (middleware + generate-workspace-manifest), `manifest.json`, `public/branding/` | ✅ Done | Critical |
| Default seed data at workspace creation | `packages/twenty-server/src/engine/workspace-manager/standard-objects/` | ⬜ TODO | Medium |
| Remove Twenty branding from email templates | `packages/twenty-emails/src/` | ⬜ TODO | Medium |
| "Privacy Policy" / "Terms of Service" links on sign-in page | `packages/twenty-front/src/pages/auth/SignInUp.tsx` | ⬜ TODO | Medium |
| Removing "Powered by Twenty" from any footer | Search `packages/twenty-front/src` for "Twenty" | ⬜ TODO | Low |

### White-label logo change (done Apr 25 2026)

**Problem:** The sign-in page always showed the Twenty "20" icon as the big primary logo, with the workspace logo as a small overlay. Clients were greeted with Twenty's branding, not their own.

**What changed:**
- `packages/twenty-front/src/pages/auth/SignInUp.tsx` — passes `workspacePublicData?.logo` as `primaryLogo` instead of `secondaryLogo` so the workspace logo is now the main logo on the sign-in screen
- `packages/twenty-front/src/modules/auth/components/Logo.tsx` — removed the hardcoded fallback to the Twenty icon; when no logo is uploaded the component renders nothing instead (see `tofu/BRANDING.md` for current default handling)

**Result:**
- Workspace with logo uploaded → client's logo shown large, centered, on sign-in page ✅
- Workspace without logo yet → clean page with just "Welcome to your workspace" text and the Continue button — no Twenty branding ✅

**Merge conflict risk:** Medium — these are UI files that upstream changes frequently. When pulling upstream, check `Logo.tsx` and `SignInUp.tsx` carefully.

---

## Customization Status Tracker

| Customization | Localhost Sandbox | First Client |
|---|---|---|
| Logo uploaded | ⬜ | ⬜ |
| Workspace name set | ⬜ | ⬜ |
| SIGN_IN_PREFILLED=false | N/A (sandbox) | ⬜ |
| Email from address set | N/A | ⬜ |
| Data model reviewed + customized | ⬜ | ⬜ |
| Pipeline stages set | ⬜ | ⬜ |
| Default views configured | ⬜ | ⬜ |
| Auth method configured | ⬜ | ⬜ |
| Users invited | ⬜ | ⬜ |
| Roles assigned | ⬜ | ⬜ |
| Automations configured | ⬜ | ⬜ |
| Email/calendar integration | ⬜ | ⬜ |
| Existing data imported | N/A | ⬜ |
| API key generated | ⬜ | ⬜ |
| Client trained | N/A | ⬜ |
