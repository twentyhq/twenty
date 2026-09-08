// Wire shapes for the two telephony providers. Both post form-encoded or JSON;
// Nest's urlencoded body parser is already enabled globally (main.ts), so a
// plain @Body() gives a parsed object either way.

// ── Moldcell PBX (ITooLabs) — PBX -> CRM pushes ───────────────────────────────
// All three commands arrive at ONE url per connector and are told apart by `cmd`.

export type MoldcellEventPush = {
  cmd: 'event';
  // INCOMING | ACCEPTED | COMPLETED | CANCELLED | OUTGOING | TRANSFERRED
  type?: string;
  phone?: string;
  // The DID the call came in on.
  diversion?: string;
  // PBX user identifier — matches `name` from cmd=accounts.
  user?: string;
  groupRealName?: string;
  ext?: string;
  telnum?: string;
  direction?: string;
  // Stable across every leg of the same call. Our correlation key.
  callid?: string;
  crm_token?: string;
};

export type MoldcellHistoryPush = {
  cmd: 'history';
  // in | out
  type?: string;
  // Success | Missed | Cancel | Busy | NotAvailable | NotAllowed | NotFound
  status?: string;
  user?: string;
  ext?: string;
  groupRealName?: string;
  telnum?: string;
  phone?: string;
  diversion?: string;
  // YYYYmmddTHHMMSSZ on push. NB: cmd=history *responses* use ISO8601 instead.
  start?: string;
  duration?: string | number;
  callid?: string;
  // Recording URL, when recording is enabled.
  link?: string;
  crm_token?: string;
  // UNDOCUMENTED but observed live. `group` is the raw `g_<uuid>` login of the
  // department the call rang; `missedStatus` accompanies `status: "missed"` and
  // its meaning is not published. Declared so the shapes we actually receive
  // typecheck, and so a reader knows they exist.
  group?: string;
  missedStatus?: string;
};

// Fires while the phone is still ringing. We must answer fast; omitting
// `responsible` is the safe fallback (the PBX then uses its own dial plan).
export type MoldcellContactPush = {
  cmd: 'contact';
  phone?: string;
  callid?: string;
  crm_token?: string;
};

export type MoldcellContactResponse = {
  contact_name?: string;
  responsible?: string;
};

export type MoldcellPush =
  | MoldcellEventPush
  | MoldcellHistoryPush
  | MoldcellContactPush;

// ── Roistat call tracking ─────────────────────────────────────────────────────
// Two slots per scenario: `webhook_start` (at-call, ~5s in, no outcome fields)
// and `webhook` (after-call, adds status/duration/link). Attribution — including
// project_id — is present on BOTH.

export type RoistatCustomFields = {
  project_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbc?: string;
  fbp?: string;
  posthog_id?: string;
  pageview_event_id?: string;
  external_id?: string;
  user_agent?: string;
  [key: string]: string | undefined;
};

export type RoistatCallWebhook = {
  // Roistat's own call id.
  id?: string;
  // Caller (client) number.
  caller?: string;
  // The tracking number that was dialled.
  callee?: string;
  // Session id — null for static call tracking, set for dynamic. Roistat sends
  // it unquoted, so it arrives as a number; the normalizer Strings() it.
  visit_id?: string | number | null;
  marker?: string | null;
  order_id?: string | null;
  // "YYYY-MM-DD HH:mm:ss"
  date?: string;
  google_client_id?: string | null;
  custom_fields?: RoistatCustomFields;
  // ANSWER | NOANSWER | BUSY | CONGESTION | CANCEL | ... (after-call only)
  status?: string;
  file_id?: string | null;
  duration?: number | string;
  // Recording URL (after-call only).
  link?: string;
  landing_page?: string | null;
  domain?: string | null;
  referrer?: string | null;
  ip?: string | null;
  city?: string | null;
  country?: string | null;
  [key: string]: unknown;
};

// ── Internal normalized form ──────────────────────────────────────────────────
// Both providers collapse into this before touching the database, so the ingest
// service has exactly one shape to reason about.

export type NormalizedCallEvent = {
  // `<provider>:<id>` — idempotency + correlation key, stored in sourceExternalId.
  externalId: string;
  provider: 'moldcell' | 'roistat';
  // Which leg of the phone system this is. Inbound becomes an inboundActivity
  // (and may become a lead); outbound becomes an outboundActivity and never
  // enters the lead pipeline — a manager dialling out is not a new lead.
  direction: 'in' | 'out';
  // Distinguishes the several pushes that share one externalId (an INCOMING
  // event, a COMPLETED event and a history push all carry the same `callid`).
  // Used for queue-level dedup, so two different pushes about one call cannot
  // collapse into a single job.
  eventKey: string;
  // Whether this push is the authoritative source of the call outcome —
  // Moldcell `history` and the Roistat after-call slot. A non-authoritative
  // event must not overwrite outcome fields an authoritative one already set.
  isAuthoritativeOutcome: boolean;
  // The REMOTE party in E.164, e.g. "+37368879173" — the caller on an inbound
  // call, the number we dialled on an outbound one. (Named for the inbound case,
  // which is the majority and the only one the lead pipeline sees.)
  callerE164?: string;
  // The DID that was dialled. Inbound only — an outbound push has no `diversion`.
  calleeDid?: string;
  occurredAt?: Date;
  // Terminal outcome, if this event carries one.
  callStatus?: string;
  durationS?: number;
  recordingUrl?: string;
  // PBX login of whoever the call reached (may be a group — not proof of pickup).
  answeredByLogin?: string;
  answeredByGroup?: string;
  // The PBX-side number this call used: the DID for inbound, the manager's own
  // direct number for outbound. Only ever informational (`telnum` on the push).
  pbxTelnum?: string;
  // Roistat's source marker. The webhook does not carry the scenario name, so
  // this is the closest available scenario identifier and is what the
  // scenario-level entry-point map is keyed on.
  roistatScenario?: string;
  // Attribution — Roistat only.
  attribution?: {
    roistatVisitId?: string;
    projectCode?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    // Derived from utm_medium — Roistat has no traffic-type concept, but the
    // deal copies this onto its first/last-touch snapshot.
    trafficType?: string;
    landingPage?: string;
    referrer?: string;
    googleClientId?: string;
    ipAddress?: string;
    city?: string;
    country?: string;
    fbclid?: string;
    fbp?: string;
    distinctId?: string;
  };
  // Verbatim payload, kept in submittedPayload as a debugging safety net.
  rawPayload: unknown;
  // True once we know the call is over, so the row can leave PENDING.
  isTerminal: boolean;
};
