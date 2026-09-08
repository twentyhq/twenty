// Telephony intake constants. See content/docs/integrations/telephony.md for the
// design of record — in particular why the PBX (not Roistat) is the primary feed:
// Roistat only tracks a minority of the DIDs people actually dial.

// The workspace a telephony webhook belongs to. Neither Moldcell nor Roistat can
// send a workspaceId, and there is no auth context on a public webhook, so it has
// to come from config. Kept in an env var rather than baked into the webhook path
// so the id is not sitting in a third-party dashboard.
export const TELEPHONY_WORKSPACE_ID = process.env.ENSO_TELEPHONY_WORKSPACE_ID;

export const MOLDCELL_PBX_BASE_URL = process.env.ENSO_MOLDCELL_PBX_BASE_URL;
// CRM -> PBX. Used for accounts/history/makeCall.
export const MOLDCELL_PBX_TOKEN = process.env.ENSO_MOLDCELL_PBX_TOKEN;
// PBX -> CRM. The PBX echoes this back as `crm_token` on every push. The API has
// no HMAC and no signing, so this shared token is the only authenticity check.
export const MOLDCELL_CRM_TOKEN = process.env.ENSO_MOLDCELL_CRM_TOKEN;
// Roistat does not sign its callbacks at all, so the secret lives in the path.
export const ROISTAT_WEBHOOK_SECRET = process.env.ENSO_ROISTAT_WEBHOOK_SECRET;

export const MOLDCELL_CRM_API_PATH = '/sys/crm_api.wcgp';

// Ceiling on a CRM→PBX command. A manager is watching a button spin, and
// `makeCall` only ASKS the PBX to start ringing — it does not wait for the call
// — so this should be short.
export const PBX_COMMAND_TIMEOUT_MS = Number(
  process.env.ENSO_TELEPHONY_PBX_COMMAND_TIMEOUT_MS ?? 8 * 1000,
);

// Hard ceiling on the synchronous `contact` answer. The PBX is holding a ringing
// call while it waits, so exceeding this is worse than not answering at all: we
// give up and let the dial plan take over rather than delay the caller.
// How stale a learned number's lastSeenAt may get before it is refreshed. One
// call produces several pushes, so without a throttle every call would rewrite
// the row a handful of times for no gain.
export const PBX_NUMBER_REFRESH_INTERVAL_MS = Number(
  process.env.ENSO_TELEPHONY_PBX_NUMBER_REFRESH_MS ?? 60 * 60 * 1000,
);

export const CONTACT_RESPONSE_BUDGET_MS = Number(
  process.env.ENSO_TELEPHONY_CONTACT_BUDGET_MS ?? 1200,
);

// Prefixes keep the two providers' id spaces apart inside the single
// `sourceExternalId` column, which is our correlation + idempotency key.
export const MOLDCELL_EXTERNAL_ID_PREFIX = 'moldcell';
export const ROISTAT_EXTERNAL_ID_PREFIX = 'roistat';

// How far apart a Roistat record and a PBX call may be and still be considered
// the same call. The PBX `callid` is authoritative but Roistat never sees it, so
// the cross-provider join is (caller phone, time window). 10 minutes matches the
// legacy Upstash TTL, which was tuned against real traffic.
export const CROSS_PROVIDER_CORRELATION_WINDOW_MS = 10 * 60 * 1000;

// `event.type` values pushed by the PBX (ITooLabs).
export const MOLDCELL_EVENT_INCOMING = 'INCOMING';
export const MOLDCELL_EVENT_ACCEPTED = 'ACCEPTED';
export const MOLDCELL_EVENT_COMPLETED = 'COMPLETED';
export const MOLDCELL_EVENT_CANCELLED = 'CANCELLED';
export const MOLDCELL_EVENT_OUTGOING = 'OUTGOING';
export const MOLDCELL_EVENT_TRANSFERRED = 'TRANSFERRED';

// Moldcell `history.status` -> inboundActivity.callStatus SELECT.
// Deliberately does NOT infer "answered" from the presence of an `account`/user:
// verified against live PBX history, a group or a real user login appears in that
// column even for calls that were never picked up. Only the status/type decides.
//
// Keys are lower-cased because the CASING IS NOT STABLE: the API docs list
// `Missed`, but a live missed-call push carried `status: "missed"`. Look values
// up through `toCallStatus`, never by direct indexing, or an unrecognised casing
// silently becomes "no status" — which is much worse than it sounds, because a
// status-less authoritative push used to read as a pickup.
const MOLDCELL_STATUS_TO_CALL_STATUS_ENTRIES: Record<string, string> = {
  success: 'ANSWERED',
  missed: 'UNANSWERED',
  cancel: 'ABANDONED',
  busy: 'BUSY',
  notavailable: 'CONGESTION',
  notallowed: 'CONGESTION',
  notfound: 'CONGESTION',
};

export const toCallStatus = (status: unknown): string | undefined =>
  MOLDCELL_STATUS_TO_CALL_STATUS_ENTRIES[
    String(status ?? '')
      .trim()
      .toLowerCase()
  ];

// Kept for the tests that assert the full mapping is covered.
export const MOLDCELL_STATUS_TO_CALL_STATUS =
  MOLDCELL_STATUS_TO_CALL_STATUS_ENTRIES;

// Roistat `status` -> inboundActivity.callStatus SELECT.
export const ROISTAT_STATUS_TO_CALL_STATUS: Record<string, string> = {
  ANSWER: 'ANSWERED',
  NOANSWER: 'UNANSWERED',
  BUSY: 'BUSY',
  CONGESTION: 'CONGESTION',
  CANCEL: 'ABANDONED',
  CHANUNAVAIL: 'CONGESTION',
  DONTCALL: 'ABANDONED',
  TORTURE: 'ABANDONED',
};

// Normalized callStatus -> outboundActivity.outcome SELECT.
//
// The two objects speak different vocabularies on purpose. inboundActivity
// records what the PHONE SYSTEM saw (ANSWERED / ABANDONED / CONGESTION);
// outboundActivity records what the MANAGER achieved (REACHED / NO_ANSWER /
// BUSY), the same vocabulary a hand-logged call uses — so an observed PBX call
// and a manually logged one read identically in the timeline. There is no
// "abandoned" outcome for an outbound call: we hung up or nobody picked up, and
// that is NO_ANSWER either way.
export const CALL_STATUS_TO_OUTBOUND_OUTCOME: Record<string, string> = {
  ANSWERED: 'REACHED',
  SALES_PICKUP: 'REACHED',
  UNANSWERED: 'NO_ANSWER',
  ABANDONED: 'NO_ANSWER',
  CONGESTION: 'NO_ANSWER',
  BUSY: 'BUSY',
  VOICEMAIL: 'VOICEMAIL',
};

// How long after pressing "Call via PBX" a PBX push may still be recognised as
// that click. makeCall returns its own CallID with no documented guarantee that
// it matches the `callid` on the pushes, so the CRM-initiated row is adopted on
// (manager, remote number, recency). Generous enough to cover a manager who
// takes their time answering their own leg, short enough that a second call to
// the same person is never mistaken for the first.
export const CRM_INITIATED_ADOPTION_WINDOW_MS = Number(
  process.env.ENSO_TELEPHONY_CRM_CALL_ADOPTION_MS ?? 5 * 60 * 1000,
);

// Recording archival. The PBX keeps recordings for about a week and — verified —
// serves them over an UNAUTHENTICATED url, so anyone holding the link can listen
// to the call. Copying the audio into the workspace's own file storage fixes both:
// the recording outlives the PBX's retention and is only reachable through a
// signed CRM url.
//
// Gated on OBJECT storage, and this is not a preference — it is a correctness
// requirement. The archiver runs on the WORKER and the download is served by the
// SERVER, which are separate deployments with separate filesystems. Under
// STORAGE_TYPE=local the worker would write the audio where the server cannot
// read it (and Railway wipes an unmounted filesystem on every deploy), producing
// attachment rows that look real and never play — strictly worse than no
// attachment. Set ENSO_TELEPHONY_ARCHIVE_RECORDINGS=true to override, but ONLY
// where server and worker genuinely share a filesystem.
// STORAGE_TYPE is accepted in several spellings (the server itself snake-cases
// it: `s3`, `S3` and `S_3` all mean the same driver), so normalize the same way.
const STORAGE_IS_OBJECT_STORE =
  (process.env.STORAGE_TYPE ?? '').replace(/[^a-z0-9]/gi, '').toUpperCase() ===
  'S3';

export const ARCHIVE_RECORDINGS =
  process.env.ENSO_TELEPHONY_ARCHIVE_RECORDINGS === 'true' ||
  (STORAGE_IS_OBJECT_STORE &&
    process.env.ENSO_TELEPHONY_ARCHIVE_RECORDINGS !== 'false');

// Hard ceiling on a single downloaded recording. A ~3 KB/s mono MP3 means 20 MB
// is roughly a two-hour call; anything larger is a bug or an abuse, not a call.
export const RECORDING_MAX_BYTES = Number(
  process.env.ENSO_TELEPHONY_RECORDING_MAX_BYTES ?? 20 * 1024 * 1024,
);

export const RECORDING_FETCH_TIMEOUT_MS = Number(
  process.env.ENSO_TELEPHONY_RECORDING_TIMEOUT_MS ?? 30 * 1000,
);

// How long to wait after a call looks finished before deciding whether it was
// answered. `event CANCELLED` is a PER-LEG push — every extension that did not
// win a department's race gets one — so the terminal pushes race each other and
// no single one of them knows the call's outcome. Waiting lets them all land, so
// the decision reads the activity's settled state instead. Observed live: all
// pushes for one call arrive within the same second, so this is generous.
export const CALL_OUTCOME_SETTLE_MS = Number(
  process.env.ENSO_TELEPHONY_OUTCOME_SETTLE_MS ?? 20 * 1000,
);

// The PBX finishes writing the audio only after the call ends, so fetching the
// instant `history` lands is a guaranteed miss on a short call.
export const RECORDING_INITIAL_DELAY_MS = Number(
  process.env.ENSO_TELEPHONY_RECORDING_INITIAL_DELAY_MS ?? 20 * 1000,
);

// A recording is written by the PBX after the call ends, and `history` can
// arrive before the file is flushed. Retrying a few times with a delay costs
// nothing and avoids permanently losing the audio to a race.
export const RECORDING_FETCH_RETRIES = 3;
export const RECORDING_RETRY_DELAY_MS = Number(
  process.env.ENSO_TELEPHONY_RECORDING_RETRY_DELAY_MS ?? 60 * 1000,
);

// PBX group logins are `g_<uuid>@<tenant>`; a real employee is `<login>@<tenant>`.
// A group in the answered-by column means "rang a department", not "a person
// answered", so it must never be treated as a sales pickup.
export const MOLDCELL_GROUP_LOGIN_PREFIX = 'g_';

// `user` values that are NOT a person. `pbx` is the switch reporting on its own
// behalf — observed on a live missed call (`status: "missed", user: "pbx"`), where
// treating it as the answerer would credit a call nobody took to a human.
export const MOLDCELL_NON_PERSON_LOGINS = new Set(['pbx']);

// Statuses that mean a human actually spoke to the caller.
export const ANSWERED_CALL_STATUSES = ['ANSWERED', 'SALES_PICKUP'];

// The two countries we operate in.
export const MOLDOVA_DIAL_PREFIX = '373';
export const ROMANIA_DIAL_PREFIX = '40';
export const MOLDOVA_CALLING_CODE = '+373';
export const ROMANIA_CALLING_CODE = '+40';
export const MOLDOVA_COUNTRY_CODE = 'MD';
export const ROMANIA_COUNTRY_CODE = 'RO';

// Project resolution for calls Roistat does not track — which is the majority.
// Roistat states the project code itself (configured per scenario), but a call
// arriving on an untracked DID only gives us the PBX department that took it and
// the number that was dialled, so those need an operator-maintained map.
//
// An entry point carries TWO independent facts, and collapsing them loses
// information: the *project* the lead belongs to, and the *queue* that should
// handle it. TRIUMF Support and TRIUMF Sales are the same project (ENS2101 —
// AVENEW and TRIUMF are one development) but must not reach the same people,
// and a support call is not a sales lead at all.
//
// Env JSON, accepting a shorthand and a full form:
//   ENSO_TELEPHONY_PROJECT_BY_PBX_GROUP={
//     "ARTIMA": "ENS2301",
//     "TRIUMF Support": { "project": "ENS2101", "queue": "support", "lead": false },
//     "TRIUMF Sales":   { "project": "ENS2101", "queue": "sales" }
//   }
//   ENSO_TELEPHONY_PROJECT_BY_DID={"37376015220":"ENS2301"}
// A bare string means "this project, default queue, is a lead". `lead: false`
// logs the call but never creates an opportunity.
export type CallEntryPoint = {
  // project.code — matches Roistat's project_id exactly. Optional, because an
  // entry point can be deliberately marked non-lead without belonging to any
  // project (an internal or test department), and inventing a project for those
  // would put junk in the attribution.
  project?: string;
  // Which team should handle it. Distinguishes destinations inside one project.
  queue?: string;
  // Whether this entry point produces a sales lead. Defaults to true.
  lead: boolean;
};

const parseEntryPoint = (value: unknown): CallEntryPoint | undefined => {
  if (typeof value === 'string') {
    return value ? { project: value, lead: true } : undefined;
  }

  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const project = record.project;
  const hasProject = typeof project === 'string' && project !== '';

  // An entry with no project is only meaningful when it explicitly opts out of
  // lead creation. Requiring `lead: false` there keeps a typo'd or half-filled
  // entry from silently becoming a project-less "lead".
  if (!hasProject && record.lead !== false) {
    return undefined;
  }

  return {
    ...(hasProject ? { project } : {}),
    ...(typeof record.queue === 'string' && record.queue
      ? { queue: record.queue }
      : {}),
    lead: record.lead !== false,
  };
};

const parseEntryPointMap = (
  raw: string | undefined,
  label: string,
): Record<string, CallEntryPoint> => {
  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== 'object' || parsed === null) {
      return {};
    }

    const entries = Object.entries(parsed as Record<string, unknown>)
      .map(([key, value]) => [key, parseEntryPoint(value)] as const)
      .filter(
        (entry): entry is [string, CallEntryPoint] => entry[1] !== undefined,
      );

    return Object.fromEntries(entries);
  } catch {
    // A malformed map must not take the whole intake path down; calls still land
    // as activities, they just arrive without a project.
    // eslint-disable-next-line no-console
    console.warn(`Ignoring malformed ${label}`);

    return {};
  }
};

export const ENTRY_POINT_BY_PBX_GROUP = parseEntryPointMap(
  process.env.ENSO_TELEPHONY_PROJECT_BY_PBX_GROUP,
  'ENSO_TELEPHONY_PROJECT_BY_PBX_GROUP',
);

export const ENTRY_POINT_BY_DID = parseEntryPointMap(
  process.env.ENSO_TELEPHONY_PROJECT_BY_DID,
  'ENSO_TELEPHONY_PROJECT_BY_DID',
);

// Roistat scenarios need the same treatment: two scenarios can share a project
// but belong to different teams. Keyed on the Roistat scenario/marker name.
export const ENTRY_POINT_BY_ROISTAT_SCENARIO = parseEntryPointMap(
  process.env.ENSO_TELEPHONY_PROJECT_BY_ROISTAT_SCENARIO,
  'ENSO_TELEPHONY_PROJECT_BY_ROISTAT_SCENARIO',
);

// Owner for an answered call whose PBX login matches no workspace member — the
// login is unmapped, or the PBX reported a group.
//
// LEAVE THIS UNSET outside of a rollout. It exists because during bring-up it
// usefully parks every answered call on one person who can verify the flow end
// to end. In steady state it does the opposite: projects whose team works in
// another system have no member who could truthfully own their deals, so the
// fallback silently files real conversations under a manager who never had
// them. Unset, such a deal opens CONNECTED unowned and the PBX login of whoever
// actually answered is recorded on the activity instead.
export const ANSWERED_OWNER_FALLBACK_EMAIL =
  process.env.ENSO_TELEPHONY_ANSWERED_OWNER_FALLBACK_EMAIL;

// Call statuses that mean the caller reached us and we did not take the call —
// i.e. a callback is owed. Deliberately excludes ABANDONED: with a 20 s ring on
// the responsible manager, "caller hung up" is dominated by misdials and
// two-second wrong numbers, and a task per one of those is noise a manager
// learns to ignore. Add 'ABANDONED' here if the sales team wants those chased.
export const CALLBACK_OWED_CALL_STATUSES = ['UNANSWERED', 'BUSY'];

// stepKey on the auto-created callback task. Doubles as the idempotency key:
// one OPEN task with this stepKey per deal at a time, so a redelivered PBX push
// cannot duplicate it and a second missed call while the first is still
// outstanding does not pile a second nudge on the same manager.
export const MISSED_CALL_CALLBACK_STEP_KEY = 'call.missed.callback';

// PBX groups that exist ONLY as a transfer fallback — where a call goes when the
// responsible manager does not answer — and are NOT any number's department.
//
// This matters because the group named on a push is the STRONGEST project signal
// we have (it beats the learned dial plan and the DID map) and is also what the
// learned dial plan is built from. Left unfiltered, the first call that fell
// through to a shared fallback group would rewrite that number's learned
// department to the fallback, and every later call on the number would resolve
// to no project and produce no deal. So a fallback group has to be excluded from
// both, by name.
//   ENSO_TELEPHONY_PBX_TRANSFER_FALLBACK_GROUPS=Callback,Обратный звонок
const PBX_TRANSFER_FALLBACK_GROUPS = new Set(
  (process.env.ENSO_TELEPHONY_PBX_TRANSFER_FALLBACK_GROUPS ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name !== ''),
);

export const isPbxTransferFallbackGroup = (
  groupName: string | undefined,
): boolean =>
  typeof groupName === 'string' && PBX_TRANSFER_FALLBACK_GROUPS.has(groupName);
