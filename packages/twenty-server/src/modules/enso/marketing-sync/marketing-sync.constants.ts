import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { toE164 } from 'src/modules/enso/shared/utils/person-phone.util';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

// The Dittofeed userId is always the CRM person UUID — the universal key.
// The CRM owns identity; Dittofeed never resolves or merges it.

export type MarketingSyncJobData =
  | {
      kind: 'identify';
      workspaceId: string;
      userId: string;
      traits: Record<string, unknown>;
      messageId: string;
    }
  | {
      kind: 'track';
      workspaceId: string;
      userId: string;
      event: string;
      properties: Record<string, unknown>;
      timestamp: string;
      messageId: string;
    }
  | {
      // deal_created: the listener only has the opportunity id; the worker job
      // enriches it (first-deal flag, project brand) from the ORM before track.
      kind: 'track_deal_created';
      workspaceId: string;
      userId: string;
      opportunityId: string;
      timestamp: string;
      messageId: string;
    }
  | {
      // Consent mirror: CRM personProjectConsent → Dittofeed subscription state,
      // so a person the CRM marks opted-out is suppressed at send. `changes` is
      // Dittofeed's {subscriptionGroupId: isSubscribed} map, pre-resolved by the
      // listener from PROJECT_SUBSCRIPTION_GROUPS.
      kind: 'sync_consent';
      workspaceId: string;
      userId: string;
      changes: Record<string, boolean>;
      messageId: string;
    };

// Track event names (Dittofeed journeys branch on these).
export const MARKETING_EVENT_DEAL_STAGE_CHANGED = 'deal_stage_changed';
// Fired when a deal is first created with a point of contact — the source
// event behind the per-development entry segments. Carries isFirstDealForPerson
// + projectName/projectCode, computed worker-side at emit (see MarketingSyncJob),
// so a segment like "New Artima Leads" can scope a journey to one development.
export const MARKETING_EVENT_DEAL_CREATED = 'deal_created';

// inboundActivity.kind → Dittofeed track event. Drives lifecycle journeys
// (form → intro drip) and the reply→drip-exit signal (inbound_message — a
// journey's engagement-exit node listens for it). Kinds match the enso
// inboundActivity SELECT values (see sequencing INBOUND_KIND_TO_CHANNEL).
export const INBOUND_ACTIVITY_EVENT_BY_KIND: Readonly<Record<string, string>> =
  {
    FORM_SUBMISSION: 'form_submitted',
    LEAD_AD: 'form_submitted',
    SOCIAL_MESSAGE: 'inbound_message',
    INCOMING_CALL: 'call_received',
    APPOINTMENT_BOOKED: 'appointment_booked',
  };

// Minimal shape of the enso inboundActivity custom object (no generated entity
// for custom objects, so we type the event payload by hand).
export type InboundActivityRecord = {
  kind: string | null;
  personId: string | null;
  opportunityId: string | null;
  projectId: string | null;
  source: string | null;
  occurredAt: string | null;
  createdAt: string | null;
};

// The four marketing-consent channels on personProjectConsent. The per-channel
// boolean field is `${channel}MarketingConsent`.
export const CONSENT_CHANNELS = ['email', 'sms', 'whatsapp', 'call'] as const;
type ConsentChannel = (typeof CONSENT_CHANNELS)[number];

// personProjectConsent boolean fields a consent change re-syncs on (a row edit
// that touches none of these — e.g. just `name` — must not re-push).
export const CONSENT_CONSENT_FIELDS: ReadonlySet<string> = new Set(
  CONSENT_CHANNELS.map((channel) => `${channel}MarketingConsent`),
);

// Minimal shape of the enso personProjectConsent custom object event payload.
export type PersonProjectConsentRecord = {
  id: string;
  personId: string | null;
  projectId: string | null;
  emailMarketingConsent: boolean | null;
  smsMarketingConsent: boolean | null;
  whatsappMarketingConsent: boolean | null;
  callMarketingConsent: boolean | null;
  updatedAt: string | null;
};

// CRM project (id) → the Dittofeed subscription groups that scope that
// development's marketing. Per-project × channel (user's choice): an unsubscribe
// revokes only that project+channel. Add a project here once its groups exist in
// Dittofeed; projects absent from the map are simply not mirrored.
//   The live pilot is IOANA RADU (ENS1901) — see the entry below.
export const PROJECT_SUBSCRIPTION_GROUPS: Readonly<
  Record<string, Partial<Record<ConsentChannel, string>>>
> = {
  // IOANA RADU (ENS1901) — the live pilot. Groups were created for the earlier
  // ENSO Estate pilot then renamed "IOANA RADU · …" (ids unchanged).
  'd8f29e3b-7955-4795-b1a6-f3bfd3b4602e': {
    email: 'b8fea92b-c85e-47f3-805c-0a038a84210d',
    sms: '2d9dfa15-6b65-4d3e-b7b2-ef0d93cc8b82',
  },
  // ARTIMA Business & Lifestyle (ENS2301) — second pilot, entered via the
  // "New ARTIMA Leads" segment (deal_created projectCode=ENS2301 + email).
  '4b63d540-a54a-4a0f-94e6-959d35d4112d': {
    email: '1a777cd5-64ae-43b1-a7de-1a8b8499dccc',
    sms: '083cfdb6-2f79-4bdb-8109-f9e241699240',
  },
};

// Resolve a consent row to Dittofeed's {subscriptionGroupId: isSubscribed} map.
// Empty when the project has no mapped groups (→ nothing to mirror). OptOut
// groups: isSubscribed=false suppresses the person at send time.
export const buildConsentSubscriptionChanges = (
  projectId: string,
  record: PersonProjectConsentRecord,
): Record<string, boolean> => {
  const groups = PROJECT_SUBSCRIPTION_GROUPS[projectId];

  if (!isDefined(groups)) {
    return {};
  }

  const changes: Record<string, boolean> = {};

  for (const channel of CONSENT_CHANNELS) {
    const subscriptionGroupId = groups[channel];

    if (!isNonEmptyString(subscriptionGroupId)) {
      continue;
    }

    changes[subscriptionGroupId] =
      record[`${channel}MarketingConsent`] === true;
  }

  return changes;
};

// Curated v1 trait set — only fields that currently exist on Person and that
// marketing segments / templates actually use. Grows as custom fields land
// (language, country, consent flags). Undefined values are dropped so we never
// clobber a Dittofeed trait with null.
// Person.languages is a workspace multi-select — read the first code (e.g.
// 'RO'/'RU') as a scalar `language` trait so Dittofeed journeys can branch on it.
const firstLanguage = (person: PersonWorkspaceEntity): string | undefined => {
  const languages = (person as unknown as { languages?: string[] | null })
    .languages;

  return Array.isArray(languages) ? languages[0] : undefined;
};

export const buildPersonTraits = (
  person: PersonWorkspaceEntity,
): Record<string, unknown> => {
  const traits: Record<string, unknown> = {
    firstName: person.name?.firstName,
    lastName: person.name?.lastName,
    email: person.emails?.primaryEmail,
    phone: toE164(
      person.phones?.primaryPhoneCallingCode,
      person.phones?.primaryPhoneNumber,
    ),
    city: person.city,
    jobTitle: person.jobTitle,
    companyId: person.companyId,
    language: firstLanguage(person),
    createdAt: person.createdAt,
  };

  return Object.fromEntries(
    Object.entries(traits).filter(([, value]) => isDefined(value)),
  );
};
