/* eslint-disable no-console */
export interface Env {
  CRM_API_TOKEN: string;
  CRM_BASE_URL: string;
  WEBHOOK_SECRET: string;
  CONVOSO_API_TOKEN: string;
  OLD_CRM_API_TOKEN: string;
  OLD_CRM_BASE_URL: string;
  CACHE: KVNamespace;
}

type ConvosoLead = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  phone_code?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  source_name?: string;
  user_name?: string;
  owner_name?: string;
  campaign_name?: string;
  address1?: string;
  address2?: string;
  notes?: string;
  field_101?: string;
  gender?: string;
  date_of_birth?: string;
  status?: string;
  status_name?: string;
  list_id?: string;
  owner_id?: string;
  last_modified_by?: string;
  is_contacted?: string;
};

type ConvosoCall = {
  // Lead identifiers
  phone_number?: string;
  phone_code?: string;
  lead_id?: string;
  first_name?: string;
  last_name?: string;
  // Call data
  uniqueid?: string;
  call_date?: string;
  status?: string;
  status_name?: string;
  call_length?: string;
  user_name?: string;
  user_id?: string;
  owner_name?: string;
  owner_id?: string;
  campaign_name?: string;
  source_name?: string;
  list_id?: string;
  queue_name?: string;
  call_type?: string;
  billable?: string;
  cost?: string;
  notes?: string;
};

type ConvosoApiLead = {
  lead_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  phone_code?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  source_name?: string;
  source_id?: string;
  list_id?: string;
  user_id?: string;
  owner_id?: string;
  last_modified_by?: string;
  is_contacted?: string;
  first_contacted_at?: string;
  campaign_name?: string;
  address1?: string;
  address2?: string;
  notes?: string;
  custom_fields?: Record<string, string>;
  gender?: string;
  date_of_birth?: string;
  status?: string;
  status_name?: string;
};

type ConvosoCallLog = {
  id: string;
  lead_id?: string;
  list_id?: string;
  campaign_id?: string;
  campaign?: string;
  user?: string;
  user_id?: string;
  phone_number?: string;
  number_dialed?: string;
  first_name?: string;
  last_name?: string;
  status?: string;
  status_name?: string;
  call_length?: string;
  call_date?: string;
  agent_comment?: string;
  queue_id?: string;
  queue?: string;
  caller_id_displayed?: string;
  inbound_number?: string;
  term_reason?: string;
  call_type?: string;
  queue_position?: string;
  queue_seconds?: string;
};

// Billing rules fetched from LeadSource objects in the CRM (costPerCall + minimumCallDuration).
// Sales team can update rates directly in the CRM without a code deploy.
type BillingRule = {
  name: string;
  costMicros: number;
  minDuration: number;
};

type PhoneInfo = {
  number: string;
  callingCode: string;
  countryCode: string;
};

type LeadReportPolicy = {
  policy_id: string;
  policy_number?: string;
  product_name?: string;
  carrier_name?: string;
  total_premium?: string;
  status_name?: string;
  phone?: string;
  reg_date?: string;
  effective_date?: string;
  expires_date?: string;
  member_name?: string;
  vendor_name?: string;
  first_name?: string;
  last_name?: string;
};

type LeadReportResponse = {
  status: boolean | number;
  response: {
    data: LeadReportPolicy[];
    current_page: number;
    total_page: number;
    per_page: number;
    total: number;
  };
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SYSTEM_USER_IDS = new Set(["666666", "666667", "666671"]);
const CACHE_TTL = 3600; // 1 hour

const POLICY_STATUS_NAME_MAP: Record<string, string> = {
  "submitted": "SUBMITTED",
  "pending": "PENDING",
  "declined": "DECLINED",
  "canceled": "CANCELED",
  "incomplete": "INCOMPLETE",
  "active / approved": "ACTIVE_APPROVED",
  "active/approved": "ACTIVE_APPROVED",
  "active / placed": "ACTIVE_PLACED",
  "active/placed": "ACTIVE_PLACED",
  "active - approved": "ACTIVE_APPROVED",
  "active - placed": "ACTIVE_PLACED",
  "active": "ACTIVE",
  "payment error - canceled": "PAYMENT_ERROR_CANCELED",
  "payment error - active/approved": "PAYMENT_ERROR_ACTIVE_APPROVED",
  "payment error - active/placed": "PAYMENT_ERROR_ACTIVE_PLACED",
  "payment error - active approved": "PAYMENT_ERROR_ACTIVE_APPROVED",
  "payment error - active placed": "PAYMENT_ERROR_ACTIVE_PLACED",
};

const POLICY_PAGE_SIZE = 10; // API ignores per_page, always returns 10
const POLICY_INCREMENTAL_PAGES = 5;
const POLICY_BACKFILL_PAGES = 5;
const POLICY_BATCH_LIMIT = 50;
const SYNCED_POLICIES_KEY = "sync:policy-ids";

// ─── Leaf helpers (no deps) ──────────────────────────────────────────────────

// Parse form-encoded or JSON body from Convoso
const parseBody = async <T>(request: Request): Promise<T> => {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return request.json();
  }
  // Form-encoded (Convoso default)
  const text = await request.text();
  const params = new URLSearchParams(text);
  const body: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    body[key] = value;
  }
  return body as unknown as T;
};

// Strip literal "null" strings and trim whitespace
const sanitize = (value?: string): string => {
  if (!value || value === "null" || value === "NULL") return "";
  return value.trim();
};

// Format date as YYYY-MM-DDTHH:MM:SS in America/New_York (Convoso account timezone)
const toConvosoDate = (date: Date): string =>
  date.toLocaleString("sv-SE", { timeZone: "America/New_York" }).replace(" ", "T");

const normalizePhone = (phone?: string, phoneCode?: string): PhoneInfo | null => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  const callingCode = phoneCode ? `+${phoneCode}` : "+1";
  // Strip country code prefix if present in the number
  if (digits.length === 11 && digits.startsWith(phoneCode || "1")) {
    return { number: digits.slice((phoneCode || "1").length), callingCode, countryCode: "US" };
  }
  return { number: digits, callingCode, countryCode: "US" };
};

// ─── CRM GraphQL helper ─────────────────────────────────────────────────────

const crmQuery = async (
  env: Env,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<Record<string, unknown>> => {
  const response = await fetch(`${env.CRM_BASE_URL}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.CRM_API_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`CRM API error ${response.status}: ${text}`);
  }

  const json = (await response.json()) as {
    data?: Record<string, unknown>;
    errors?: Array<{ message: string }>;
  };

  if (json.errors?.length) {
    throw new Error(`CRM GraphQL error: ${json.errors[0].message}`);
  }

  return json.data!;
};

// ─── Convoso API helpers (cached in KV) ─────────────────────────────────────

// Resolve Convoso list_id to list name, cached in KV
const resolveConvosoListName = async (
  env: Env,
  listId: string,
): Promise<string | null> => {
  const cacheKey = `convoso:lists`;

  // Try KV cache first
  let listMap = await env.CACHE.get<Record<string, string>>(cacheKey, "json");

  if (!listMap) {
    try {
      const response = await fetch(
        `https://api.convoso.com/v1/lists/search?auth_token=${env.CONVOSO_API_TOKEN}`,
        { headers: { "Content-Type": "application/json" } },
      );

      if (!response.ok) return null;

      const json = (await response.json()) as {
        success: boolean;
        data?: Array<{ id: number; name: string }>;
      };

      if (!json.success || !json.data?.length) return null;

      // Build id→name map and cache it
      listMap = {};
      for (const list of json.data) {
        listMap[String(list.id)] = list.name;
      }
      await env.CACHE.put(cacheKey, JSON.stringify(listMap), { expirationTtl: CACHE_TTL });
    } catch {
      console.error(`Failed to resolve Convoso list ${listId}`);
      return null;
    }
  }

  return listMap[listId] ?? null;
};

// Resolve Convoso user ID to full name, cached in KV
const resolveConvosoUserName = async (
  env: Env,
  userId: string,
): Promise<string | null> => {
  const cacheKey = `convoso:users`;

  // Try KV cache first
  let userMap = await env.CACHE.get<Record<string, string>>(cacheKey, "json");

  if (!userMap) {
    try {
      const response = await fetch(
        `https://api.convoso.com/v1/users/search?auth_token=${env.CONVOSO_API_TOKEN}&limit=100`,
        { headers: { "Content-Type": "application/json" } },
      );

      if (!response.ok) return null;

      const json = (await response.json()) as {
        success: boolean;
        data?: {
          results: Record<string, { id: number; first_name: string; last_name: string }>;
        };
      };

      if (!json.success || !json.data?.results) return null;

      // Build id→name map and cache it
      userMap = {};
      for (const [id, user] of Object.entries(json.data.results)) {
        userMap[id] = [user.first_name, user.last_name].filter(Boolean).join(" ");
      }
      await env.CACHE.put(cacheKey, JSON.stringify(userMap), { expirationTtl: CACHE_TTL });
    } catch {
      console.error(`Failed to resolve Convoso user ${userId}`);
      return null;
    }
  }

  return userMap[userId] ?? null;
};

// ─── CRM lookup helpers ─────────────────────────────────────────────────────

const findPersonByPhone = async (
  env: Env,
  phone: string,
): Promise<string | null> => {
  const query = `
    query FindPersonByPhone($filter: PersonFilterInput) {
      people(filter: $filter, first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  `;

  const data = await crmQuery(env, query, {
    filter: {
      phones: {
        primaryPhoneNumber: {
          eq: phone,
        },
      },
    },
  });

  const people = data.people as {
    edges: Array<{ node: { id: string } }>;
  };

  return people.edges.length > 0 ? people.edges[0].node.id : null;
};

const findLeadSourceByName = async (
  env: Env,
  name: string,
): Promise<string | null> => {
  // Check KV cache
  const cacheKey = `crm:leadsource:${name}`;
  const cached = await env.CACHE.get(cacheKey);
  if (cached) return cached;

  const query = `
    query FindLeadSource($filter: LeadSourceFilterInput) {
      leadSources(filter: $filter, first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  `;

  try {
    const data = await crmQuery(env, query, {
      filter: { name: { eq: name } },
    });

    const sources = data.leadSources as {
      edges: Array<{ node: { id: string } }>;
    };

    const id = sources.edges.length > 0 ? sources.edges[0].node.id : null;
    if (id) {
      await env.CACHE.put(cacheKey, id, { expirationTtl: CACHE_TTL });
    }
    return id;
  } catch {
    // Lead Source object may not exist yet; skip silently
    return null;
  }
};

const findAgentProfileByName = async (
  env: Env,
  name: string,
): Promise<string | null> => {
  // Check KV cache
  const cacheKey = `crm:agent:${name}`;
  const cached = await env.CACHE.get(cacheKey);
  if (cached) return cached;

  const query = `
    query FindAgentProfile($filter: AgentProfileFilterInput) {
      agentProfiles(filter: $filter, first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  `;

  try {
    const data = await crmQuery(env, query, {
      filter: { name: { like: `%${name}%` } },
    });

    const profiles = data.agentProfiles as {
      edges: Array<{ node: { id: string } }>;
    };

    const id = profiles.edges.length > 0 ? profiles.edges[0].node.id : null;
    if (id) {
      await env.CACHE.put(cacheKey, id, { expirationTtl: CACHE_TTL });
    }
    return id;
  } catch {
    // Agent Profile object may not exist yet; skip silently
    return null;
  }
};

const createPerson = async (
  env: Env,
  input: Record<string, unknown>,
): Promise<{ id: string }> => {
  const query = `
    mutation CreatePerson($input: PersonCreateInput!) {
      createPerson(data: $input) {
        id
      }
    }
  `;

  const data = await crmQuery(env, query, { input });
  return data.createPerson as { id: string };
};

const updatePerson = async (
  env: Env,
  id: string,
  input: Record<string, unknown>,
): Promise<{ id: string }> => {
  const query = `
    mutation UpdatePerson($id: UUID!, $input: PersonUpdateInput!) {
      updatePerson(id: $id, data: $input) {
        id
      }
    }
  `;

  const data = await crmQuery(env, query, { id, input });
  return data.updatePerson as { id: string };
};

const personHasNotes = async (
  env: Env,
  personId: string,
): Promise<boolean> => {
  const query = `
    query PersonNotes($filter: NoteTargetFilterInput) {
      noteTargets(filter: $filter, first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  `;

  const data = await crmQuery(env, query, {
    filter: { targetPersonId: { eq: personId } },
  });

  const targets = data.noteTargets as {
    edges: Array<{ node: { id: string } }>;
  };

  return targets.edges.length > 0;
};

const createNoteForPerson = async (
  env: Env,
  personId: string,
  noteText: string,
): Promise<void> => {
  // Create the Note
  const noteQuery = `
    mutation CreateNote($input: NoteCreateInput!) {
      createNote(data: $input) {
        id
      }
    }
  `;

  const noteData = await crmQuery(env, noteQuery, {
    input: {
      title: "Convoso Notes",
      bodyV2: { markdown: noteText },
    },
  });

  const noteId = (noteData.createNote as { id: string }).id;

  // Link Note to Person via NoteTarget
  const targetQuery = `
    mutation CreateNoteTarget($input: NoteTargetCreateInput!) {
      createNoteTarget(data: $input) {
        id
      }
    }
  `;

  await crmQuery(env, targetQuery, {
    input: {
      noteId,
      targetPersonId: personId,
    },
  });
};

const findCallByConvosoId = async (
  env: Env,
  convosoCallId: string,
): Promise<string | null> => {
  const query = `
    query FindCall($filter: CallFilterInput) {
      calls(filter: $filter, first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  `;

  try {
    const data = await crmQuery(env, query, {
      filter: { convosoCallId: { eq: convosoCallId } },
    });

    const calls = data.calls as {
      edges: Array<{ node: { id: string } }>;
    };

    return calls.edges.length > 0 ? calls.edges[0].node.id : null;
  } catch {
    return null;
  }
};

const createCall = async (
  env: Env,
  input: Record<string, unknown>,
): Promise<{ id: string }> => {
  const query = `
    mutation CreateCall($input: CallCreateInput!) {
      createCall(data: $input) {
        id
      }
    }
  `;

  const data = await crmQuery(env, query, { input });
  return data.createCall as { id: string };
};

// Batch-fetch all convosoCallIds already in the CRM since a given date.
// Returns a Set for O(1) dedup lookups — replaces N individual findCallByConvosoId queries.
const fetchExistingConvosoCallIds = async (
  env: Env,
  since: Date,
): Promise<Set<string>> => {
  const ids = new Set<string>();
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const afterClause = cursor ? `, after: "${cursor}"` : "";
    const data = await crmQuery(
      env,
      `
      query RecentCalls($filter: CallFilterInput) {
        calls(filter: $filter, first: 500${afterClause}) {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              convosoCallId
            }
          }
        }
      }
    `,
      {
        filter: { callDate: { gte: since.toISOString() } },
      },
    );

    const result = data.calls as {
      pageInfo: { hasNextPage: boolean; endCursor: string };
      edges: Array<{ node: { convosoCallId: string | null } }>;
    };

    for (const edge of result.edges) {
      if (edge.node.convosoCallId) {
        ids.add(edge.node.convosoCallId);
      }
    }

    hasNextPage = result.pageInfo.hasNextPage;
    cursor = result.pageInfo.endCursor;
  }

  return ids;
};

const fetchBillingRules = async (env: Env): Promise<BillingRule[]> => {
  const cacheKey = "crm:billing-rules";
  const cached = await env.CACHE.get<BillingRule[]>(cacheKey, "json");
  if (cached) return cached;

  const rules: BillingRule[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const afterClause = cursor ? `, after: "${cursor}"` : "";
    const data = await crmQuery(env, `
      query {
        leadSources(first: 50${afterClause}) {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              name
              costPerCall { amountMicros }
              minimumCallDuration
            }
          }
        }
      }
    `);

    const result = data.leadSources as {
      pageInfo: { hasNextPage: boolean; endCursor: string };
      edges: Array<{ node: { name: string; costPerCall?: { amountMicros: number }; minimumCallDuration?: number } }>;
    };

    for (const edge of result.edges) {
      rules.push({
        name: edge.node.name,
        costMicros: edge.node.costPerCall?.amountMicros ?? 0,
        minDuration: edge.node.minimumCallDuration ?? 0,
      });
    }

    hasNextPage = result.pageInfo.hasNextPage;
    cursor = result.pageInfo.endCursor;
  }

  // Cache for 30 minutes (balances freshness with KV put budget on free tier)
  await env.CACHE.put(cacheKey, JSON.stringify(rules), { expirationTtl: 1800 });
  return rules;
};

const createPolicy = async (
  env: Env,
  input: Record<string, unknown>,
): Promise<{ id: string }> => {
  const query = `
    mutation CreatePolicy($input: PolicyCreateInput!) {
      createPolicy(data: $input) {
        id
      }
    }
  `;

  const data = await crmQuery(env, query, { input });
  return data.createPolicy as { id: string };
};

const updatePolicy = async (
  env: Env,
  id: string,
  input: Record<string, unknown>,
): Promise<{ id: string }> => {
  const query = `
    mutation UpdatePolicy($id: UUID!, $input: PolicyUpdateInput!) {
      updatePolicy(id: $id, data: $input) {
        id
      }
    }
  `;

  const data = await crmQuery(env, query, { id, input });
  return data.updatePolicy as { id: string };
};

// ─── Derived helpers (depend on Level 2) ────────────────────────────────────

const deriveLeadStatus = (
  lead: ConvosoLead,
  agentProfileId: string | null,
): string => {
  // Convoso API provides is_contacted directly (cron path)
  if (lead.is_contacted === "1") return "CONTACTED";

  const hasName = !!(sanitize(lead.first_name) || sanitize(lead.last_name));
  const hasNotes = !!sanitize(lead.notes);

  // If an agent filled in name or notes, they've made contact
  if (hasName || hasNotes) return "CONTACTED";

  // If assigned to an agent (owner_id is set)
  if (agentProfileId || (lead.owner_id && lead.owner_id !== "0")) return "ASSIGNED";

  return "IDLE";
};

// Find lead source by name, or create it if it doesn't exist
const findOrCreateLeadSource = async (
  env: Env,
  name: string,
): Promise<string | null> => {
  const existingId = await findLeadSourceByName(env, name);
  if (existingId) return existingId;

  try {
    const query = `
      mutation CreateLeadSource($input: LeadSourceCreateInput!) {
        createLeadSource(data: $input) {
          id
        }
      }
    `;

    const data = await crmQuery(env, query, { input: { name } });
    const created = data.createLeadSource as { id: string };
    console.log(`Created new Lead Source: "${name}" (${created.id})`);
    // Cache the newly created lead source
    await env.CACHE.put(`crm:leadsource:${name}`, created.id, { expirationTtl: CACHE_TTL });
    return created.id;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Failed to create Lead Source "${name}": ${message}`);
    return null;
  }
};

const computeBilling = async (
  env: Env,
  queueName: string | undefined,
  sourceName: string | undefined,
  direction: string,
  duration: number,
): Promise<{ billable: boolean; cost: { amountMicros: number; currencyCode: string } }> => {
  const noBill = { billable: false, cost: { amountMicros: 0, currencyCode: "USD" } };

  if (direction !== "INBOUND") return noBill;

  const label = (queueName || sourceName || "").toLowerCase();
  if (!label) return noBill;

  const rules = await fetchBillingRules(env);

  // Match queue name against lead source names (case-insensitive substring).
  // Prefer the longest matching name (most specific).
  let bestMatch: BillingRule | null = null;
  for (const rule of rules) {
    const ruleName = rule.name.toLowerCase();
    if (label.includes(ruleName) || ruleName.includes(label)) {
      if (!bestMatch || rule.name.length > bestMatch.name.length) {
        bestMatch = rule;
      }
    }
  }

  if (!bestMatch) return noBill;

  const meetsDuration = bestMatch.minDuration === 0 || duration >= bestMatch.minDuration;
  return {
    billable: meetsDuration,
    cost: meetsDuration
      ? { amountMicros: bestMatch.costMicros, currencyCode: "USD" }
      : { amountMicros: 0, currencyCode: "USD" },
  };
};

// ─── Build helpers (depend on Level 3) ──────────────────────────────────────

const buildPersonInput = (
  lead: ConvosoLead,
  phone: PhoneInfo | null,
  leadSourceId: string | null,
  agentProfileId: string | null,
): Record<string, unknown> => {
  const input: Record<string, unknown> = {
    name: {
      firstName: lead.first_name || "",
      lastName: lead.last_name || "",
    },
  };

  if (lead.email) {
    input.emails = {
      primaryEmail: lead.email,
    };
  }

  if (phone) {
    input.phones = {
      primaryPhoneNumber: phone.number,
      primaryPhoneCallingCode: phone.callingCode,
      primaryPhoneCountryCode: phone.countryCode,
    };
  }

  const address1 = sanitize(lead.address1);
  if (address1 || lead.city || lead.state || lead.postal_code) {
    input.addressCustom = {
      addressStreet1: address1,
      addressCity: sanitize(lead.city),
      addressState: sanitize(lead.state),
      addressPostcode: sanitize(lead.postal_code),
    };
  }

  // Notes are a separate object in the CRM (Note + NoteTarget), not a Person field.
  // TODO: create Note linked to Person if lead.notes is present.

  const gender = sanitize(lead.gender);
  if (gender) {
    input.gender = gender.toUpperCase();
  }

  if (lead.date_of_birth) {
    input.dateOfBirth = new Date(lead.date_of_birth).toISOString();
  }

  if (leadSourceId) {
    input.leadSourceId = leadSourceId;
  }

  if (agentProfileId) {
    input.assignedAgentId = agentProfileId;
  }

  // Derive lead status from available signals
  input.leadStatus = deriveLeadStatus(lead, agentProfileId);

  return input;
};

const buildCallInputFromLog = async (
  env: Env,
  log: ConvosoCallLog,
  leadId: string | null,
  agentId: string | null,
  leadSourceId: string | null,
  queueLabel: string,
  sourceName: string | null,
): Promise<Record<string, unknown>> => {
  const direction = log.call_type === "INBOUND" ? "Inbound" : "Outbound";

  const input: Record<string, unknown> = {
    name: `${direction} - ${queueLabel}`,
    convosoCallId: log.id,
    status: sanitize(log.status),
    statusName: sanitize(log.status_name),
  };

  if (log.lead_id) {
    input.convosoLeadId = log.lead_id;
  }

  if (log.call_date) {
    // Convoso dates are Eastern time (account Default GMT), convert to ISO
    input.callDate = new Date(log.call_date + " GMT-0500").toISOString();
  }

  if (log.call_length) {
    const seconds = parseInt(log.call_length, 10);
    if (!isNaN(seconds)) {
      input.duration = seconds;
    }
  }

  if (log.queue) {
    input.queueName = log.queue;
  }

  if (log.call_type) {
    input.direction = log.call_type === "INBOUND" ? "INBOUND" : "OUTBOUND";
  }

  if (leadId) {
    input.leadId = leadId;
  }

  if (agentId) {
    input.agentId = agentId;
  }

  if (leadSourceId) {
    input.leadSourceId = leadSourceId;
  }

  // Compute billable + cost from CRM lead source billing rules matched by queue name
  const duration = (input.duration as number) || 0;
  const billing = await computeBilling(env, log.queue, sourceName ?? undefined, input.direction as string, duration);
  input.billable = billing.billable;
  input.cost = billing.cost;

  return input;
};

const buildCallInput = async (
  env: Env,
  call: ConvosoCall,
  leadId: string | null,
  agentId: string | null,
  leadSourceId: string | null,
  queueLabel: string,
  sourceName: string | null,
): Promise<Record<string, unknown>> => {
  const ct = (call.call_type || "").toUpperCase();
  const direction = ct.includes("IN") ? "Inbound" : "Outbound";

  const input: Record<string, unknown> = {
    name: `${direction} - ${queueLabel}`,
    status: sanitize(call.status),
    statusName: sanitize(call.status_name),
  };

  if (call.uniqueid) {
    input.convosoCallId = call.uniqueid;
  }

  if (call.lead_id) {
    input.convosoLeadId = call.lead_id;
  }

  if (call.call_date) {
    // Convoso dates are Eastern time (account Default GMT), convert to ISO
    input.callDate = new Date(call.call_date + " GMT-0500").toISOString();
  }

  // Duration in seconds
  if (call.call_length) {
    const seconds = parseInt(call.call_length, 10);
    if (!isNaN(seconds)) {
      input.duration = seconds;
    }
  }

  if (call.queue_name) {
    input.queueName = sanitize(call.queue_name);
  }

  // Direction: map call_type to the Select field options
  if (ct) {
    input.direction = ct.includes("IN") ? "INBOUND" : "OUTBOUND";
  }

  if (leadId) {
    input.leadId = leadId;
  }

  if (agentId) {
    input.agentId = agentId;
  }

  if (leadSourceId) {
    input.leadSourceId = leadSourceId;
  }

  // Compute billable + cost from CRM lead source billing rules matched by queue name
  const duration = (input.duration as number) || 0;
  const billing = await computeBilling(env, call.queue_name, sourceName ?? undefined, input.direction as string, duration);
  input.billable = billing.billable;
  input.cost = billing.cost;

  return input;
};

const buildPolicyInputFromReport = async (
  env: Env,
  policy: LeadReportPolicy,
  personId: string,
  carrierCache: Map<string, string | null>,
  productCache: Map<string, string | null>,
  agentCache: Map<string, string | null>,
): Promise<Record<string, unknown>> => {
  const input: Record<string, unknown> = {
    name: policy.policy_number || policy.product_name || "Policy",
    leadId: personId,
    oldCrmPolicyId: policy.policy_id,
  };

  if (policy.total_premium) {
    const premium = parseFloat(policy.total_premium);
    if (!isNaN(premium)) {
      input.premium = {
        amountMicros: Math.round(premium * 1_000_000),
        currencyCode: "USD",
      };
    }
  }

  if (policy.status_name) {
    const status = POLICY_STATUS_NAME_MAP[policy.status_name.toLowerCase()];
    if (status) {
      input.status = status;
    }
  }

  if (policy.effective_date) {
    input.effectiveDate = new Date(policy.effective_date).toISOString();
  }

  if (policy.expires_date) {
    input.expirationDate = new Date(policy.expires_date).toISOString();
  }

  // Carrier (in-memory cached)
  if (policy.carrier_name) {
    let carrierId: string | null;
    if (carrierCache.has(policy.carrier_name)) {
      carrierId = carrierCache.get(policy.carrier_name)!;
    } else {
      carrierId = await findOrCreateCarrier(env, policy.carrier_name);
      carrierCache.set(policy.carrier_name, carrierId);
    }
    if (carrierId) {
      input.carrierId = carrierId;
    }
  }

  // Product (in-memory cached)
  if (policy.product_name) {
    let productId: string | null;
    if (productCache.has(policy.product_name)) {
      productId = productCache.get(policy.product_name)!;
    } else {
      productId = await findOrCreateProduct(env, policy.product_name);
      productCache.set(policy.product_name, productId);
    }
    if (productId) {
      input.productId = productId;
    }
  }

  // Agent (in-memory cached)
  if (policy.member_name) {
    let agentId: string | null;
    if (agentCache.has(policy.member_name)) {
      agentId = agentCache.get(policy.member_name)!;
    } else {
      agentId = await findAgentProfileByName(env, policy.member_name);
      agentCache.set(policy.member_name, agentId);
    }
    if (agentId) {
      input.agentId = agentId;
    }
  }

  if (policy.reg_date) {
    input.submittedDate = new Date(policy.reg_date).toISOString();
  }

  return input;
};

// ─── Lead Report API helpers ─────────────────────────────────────────────────

const fetchLeadReportPage = async (
  env: Env,
  page: number,
  perPage: number,
): Promise<LeadReportResponse | null> => {
  const url = new URL(`${env.OLD_CRM_BASE_URL}/lead-report-api`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`lead-report-api error ${response.status}: ${text}`);
    return null;
  }

  return (await response.json()) as LeadReportResponse;
};

const findOrCreateCarrier = async (
  env: Env,
  name: string,
): Promise<string | null> => {
  const cacheKey = `crm:carrier:${name}`;
  const cached = await env.CACHE.get(cacheKey);
  if (cached) return cached;

  try {
    const data = await crmQuery(env, `
      query FindCarrier($filter: CarrierFilterInput) {
        carriers(filter: $filter, first: 1) {
          edges { node { id } }
        }
      }
    `, { filter: { name: { eq: name } } });

    const carriers = data.carriers as { edges: Array<{ node: { id: string } }> };
    if (carriers.edges.length > 0) {
      const id = carriers.edges[0].node.id;
      await env.CACHE.put(cacheKey, id, { expirationTtl: CACHE_TTL });
      return id;
    }
  } catch {
    // Carrier object may not exist yet
  }

  try {
    const data = await crmQuery(env, `
      mutation CreateCarrier($input: CarrierCreateInput!) {
        createCarrier(data: $input) { id }
      }
    `, { input: { name } });

    const created = data.createCarrier as { id: string };
    console.log(`Created new Carrier: "${name}" (${created.id})`);
    await env.CACHE.put(cacheKey, created.id, { expirationTtl: CACHE_TTL });
    return created.id;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Failed to create Carrier "${name}": ${message}`);
    return null;
  }
};

const findOrCreateProduct = async (
  env: Env,
  name: string,
): Promise<string | null> => {
  const cacheKey = `crm:product:${name}`;
  const cached = await env.CACHE.get(cacheKey);
  if (cached) return cached;

  try {
    const data = await crmQuery(env, `
      query FindProduct($filter: ProductFilterInput) {
        products(filter: $filter, first: 1) {
          edges { node { id } }
        }
      }
    `, { filter: { name: { eq: name } } });

    const products = data.products as { edges: Array<{ node: { id: string } }> };
    if (products.edges.length > 0) {
      const id = products.edges[0].node.id;
      await env.CACHE.put(cacheKey, id, { expirationTtl: CACHE_TTL });
      return id;
    }
  } catch {
    // Product object may not exist yet
  }

  try {
    const data = await crmQuery(env, `
      mutation CreateProduct($input: ProductCreateInput!) {
        createProduct(data: $input) { id }
      }
    `, { input: { name } });

    const created = data.createProduct as { id: string };
    console.log(`Created new Product: "${name}" (${created.id})`);
    await env.CACHE.put(cacheKey, created.id, { expirationTtl: CACHE_TTL });
    return created.id;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Failed to create Product "${name}": ${message}`);
    return null;
  }
};

const findPolicyByOldId = async (
  env: Env,
  oldId: string,
): Promise<{ id: string; status: string } | null> => {
  try {
    const data = await crmQuery(env, `
      query FindPolicy($filter: PolicyFilterInput) {
        policies(filter: $filter, first: 1) {
          edges { node { id status } }
        }
      }
    `, { filter: { oldCrmPolicyId: { eq: oldId } } });

    const policies = data.policies as { edges: Array<{ node: { id: string; status: string } }> };
    return policies.edges.length > 0 ? policies.edges[0].node : null;
  } catch {
    return null;
  }
};

const loadSyncedPolicyIds = async (env: Env): Promise<Map<string, string>> => {
  const raw = await env.CACHE.get<Record<string, string>>(SYNCED_POLICIES_KEY, "json");
  return raw ? new Map(Object.entries(raw)) : new Map();
};

const saveSyncedPolicyIds = async (env: Env, map: Map<string, string>): Promise<void> => {
  const obj: Record<string, string> = {};
  for (const [k, v] of map.entries()) {
    obj[k] = v;
  }
  await env.CACHE.put(SYNCED_POLICIES_KEY, JSON.stringify(obj));
};

// ─── Top-level handlers ─────────────────────────────────────────────────────

const handleLead = async (request: Request, env: Env): Promise<Response> => {
  const lead = await parseBody<ConvosoLead>(request);
  console.log("Incoming lead payload:", JSON.stringify(lead));
  if (!lead.phone_number && !lead.email) {
    return Response.json(
      { error: "phone_number or email is required" },
      { status: 400 },
    );
  }

  const phone = normalizePhone(lead.phone_number, lead.phone_code);

  try {
    // Resolve lead source: prefer source_name, fall back to list_id lookup via Convoso API
    let leadSourceId: string | null = null;
    let sourceName: string | null = lead.source_name ?? null;
    if (!sourceName && lead.list_id) {
      sourceName = await resolveConvosoListName(env, lead.list_id);
    }
    if (sourceName) {
      leadSourceId = await findOrCreateLeadSource(env, sourceName);
    }

    // Resolve agent: prefer owner_name/user_name from payload, fall back to owner_id/last_modified_by via Convoso API
    let agentProfileId: string | null = null;
    let agentName: string | null = lead.owner_name || lead.user_name || null;
    if (!agentName) {
      const agentUserId = (lead.owner_id && lead.owner_id !== "0") ? lead.owner_id : lead.last_modified_by;
      if (agentUserId) {
        agentName = await resolveConvosoUserName(env, agentUserId);
      }
    }
    if (agentName) {
      agentProfileId = await findAgentProfileByName(env, agentName);
    }

    // Check for existing person by phone
    let existingPersonId: string | null = null;
    if (phone) {
      existingPersonId = await findPersonByPhone(env, phone.number);
    }

    // Build person input
    const personInput = buildPersonInput(
      lead,
      phone,
      leadSourceId,
      agentProfileId,
    );

    let result;
    if (existingPersonId) {
      result = await updatePerson(env, existingPersonId, personInput);
    } else {
      result = await createPerson(env, personInput);
    }

    // Create a Note if the person doesn't have any yet
    if (lead.notes) {
      const hasNotes = await personHasNotes(env, result.id);
      if (!hasNotes) {
        await createNoteForPerson(env, result.id, lead.notes);
      }
    }

    return Response.json({
      success: true,
      action: existingPersonId ? "updated" : "created",
      personId: result.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Lead sync failed:", message);
    return Response.json({ error: message }, { status: 500 });
  }
};

const handleCall = async (request: Request, env: Env): Promise<Response> => {
  const call = await parseBody<ConvosoCall>(request);
  console.log("Incoming call payload:", JSON.stringify(call));

  if (!call.phone_number) {
    return Response.json(
      { error: "phone_number is required" },
      { status: 400 },
    );
  }

  // Reject incomplete payloads — Convoso workflows often fire early with
  // minimal data (just phone_number). The cron handles these with full data
  // from the call log API, so skip creation here to avoid ghost records.
  if (!call.call_type && !call.status && !call.uniqueid) {
    console.log(`Skipping incomplete call payload for ${call.phone_number} (no call_type, status, or uniqueid)`);
    return Response.json({
      success: true,
      action: "skipped",
      reason: "incomplete payload — missing call_type, status, and uniqueid",
    });
  }

  const phone = normalizePhone(call.phone_number, call.phone_code);

  try {
    // Deduplicate by Convoso call ID
    if (call.uniqueid) {
      const existingCallId = await findCallByConvosoId(env, call.uniqueid);
      if (existingCallId) {
        return Response.json({
          success: true,
          action: "skipped",
          callId: existingCallId,
          reason: "duplicate",
        });
      }
    }

    // Look up the person (lead) by phone
    let leadId: string | null = null;
    if (phone) {
      leadId = await findPersonByPhone(env, phone.number);
    }

    // Resolve agent: prefer name fields, fall back to user_id/owner_id via Convoso API
    let agentId: string | null = null;
    let agentName: string | null = call.owner_name || call.user_name || null;
    if (!agentName) {
      const agentUserId = (call.owner_id && call.owner_id !== "0") ? call.owner_id : call.user_id;
      if (agentUserId) {
        agentName = await resolveConvosoUserName(env, agentUserId);
      }
    }
    if (agentName) {
      agentId = await findAgentProfileByName(env, agentName);
    }

    // Resolve lead source: prefer source_name, fall back to list_id
    let leadSourceId: string | null = null;
    let sourceName: string | null = call.source_name ?? null;
    if (!sourceName && call.list_id) {
      sourceName = await resolveConvosoListName(env, call.list_id);
    }
    if (sourceName) {
      leadSourceId = await findOrCreateLeadSource(env, sourceName);
    }

    // Build queue label for call name: queue → lead source → campaign → agent → phone
    const queueLabel = call.queue_name || sourceName || call.campaign_name || agentName || call.phone_number || "Unknown";

    // Build and create the Call record
    const callInput = await buildCallInput(env, call, leadId, agentId, leadSourceId, queueLabel, sourceName);
    const result = await createCall(env, callInput);

    return Response.json({
      success: true,
      action: "created",
      callId: result.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Call sync failed:", message);
    return Response.json({ error: message }, { status: 500 });
  }
};

// Convert a Convoso API lead to our internal format and sync it.
// phoneCache + notesCache are in-memory for the duration of the cron run to
// avoid burning subrequests on repeated lookups for the same phone/person.
const syncConvosoApiLead = async (
  env: Env,
  apiLead: ConvosoApiLead,
  phoneCache: Map<string, string | null>,
  notesCache: Set<string>,
): Promise<void> => {
  const lead: ConvosoLead = {
    first_name: apiLead.first_name,
    last_name: apiLead.last_name,
    email: apiLead.email,
    phone_number: apiLead.phone_number,
    phone_code: apiLead.phone_code,
    city: apiLead.city,
    state: apiLead.state,
    postal_code: apiLead.postal_code,
    source_name: apiLead.source_name,
    list_id: apiLead.list_id,
    owner_id: apiLead.owner_id,
    last_modified_by: apiLead.last_modified_by,
    is_contacted: apiLead.is_contacted,
    campaign_name: apiLead.campaign_name,
    address1: apiLead.address1,
    address2: apiLead.address2,
    notes: apiLead.notes,
    gender: apiLead.gender,
    date_of_birth: apiLead.date_of_birth,
    status: apiLead.status,
    status_name: apiLead.status_name,
  };

  if (!lead.phone_number && !lead.email) {
    return;
  }

  const phone = normalizePhone(lead.phone_number, lead.phone_code);

  // Resolve lead source: prefer source_name, fall back to list_id (KV cached)
  let leadSourceId: string | null = null;
  let sourceName: string | null = lead.source_name ?? null;
  if (!sourceName && lead.list_id) {
    sourceName = await resolveConvosoListName(env, lead.list_id);
  }
  if (sourceName) {
    leadSourceId = await findOrCreateLeadSource(env, sourceName);
  }

  // Resolve agent: prefer owner_name/user_name, fall back to owner_id/last_modified_by (KV cached)
  let agentProfileId: string | null = null;
  let agentName: string | null = lead.owner_name || lead.user_name || null;
  if (!agentName) {
    const agentUserId = (lead.owner_id && lead.owner_id !== "0") ? lead.owner_id : lead.last_modified_by;
    if (agentUserId) {
      agentName = await resolveConvosoUserName(env, agentUserId);
    }
  }
  if (agentName) {
    agentProfileId = await findAgentProfileByName(env, agentName);
  }

  // Find existing person by phone (in-memory cache backed by single serialized KV key).
  // The KV phone cache is loaded/saved in syncRecentLeads as ONE key, not per-phone.
  let existingPersonId: string | null = null;
  if (phone) {
    if (phoneCache.has(phone.number)) {
      existingPersonId = phoneCache.get(phone.number)!;
    } else {
      existingPersonId = await findPersonByPhone(env, phone.number);
      phoneCache.set(phone.number, existingPersonId);
    }
  }

  const personInput = buildPersonInput(lead, phone, leadSourceId, agentProfileId);

  let personId: string;
  if (existingPersonId) {
    const result = await updatePerson(env, existingPersonId, personInput);
    personId = result.id;
  } else {
    const result = await createPerson(env, personInput);
    personId = result.id;
    // Cache the newly created person so later leads with same phone skip the lookup
    if (phone) {
      phoneCache.set(phone.number, personId);
    }
  }

  // Notes check (in-memory cached — once we know a person has notes, skip future checks)
  if (lead.notes && !notesCache.has(personId)) {
    const hasNotes = await personHasNotes(env, personId);
    if (hasNotes) {
      notesCache.add(personId);
    } else {
      await createNoteForPerson(env, personId, lead.notes);
      notesCache.add(personId);
    }
  }
};

// ─── Cron sync handlers ─────────────────────────────────────────────────────

// Cron-based sync: fetch recently updated leads from Convoso API
const syncRecentLeads = async (env: Env): Promise<void> => {
  const now = new Date();
  // Look back 15 minutes to cover the cron interval with overlap
  const since = new Date(now.getTime() - 15 * 60 * 1000);

  // Pre-warm Convoso list + user caches in a single pass
  await resolveConvosoListName(env, "0");
  await resolveConvosoUserName(env, "0");

  // 1. Fetch ALL recently updated leads with pagination (old code capped at 25)
  const allLeads: ConvosoApiLead[] = [];
  let offset = 0;
  const PAGE_SIZE = 200;

  while (true) {
    const params = new URLSearchParams({
      auth_token: env.CONVOSO_API_TOKEN,
      updated_at_start_date: toConvosoDate(since),
      updated_at_end_date: toConvosoDate(now),
      limit: String(PAGE_SIZE),
      offset: String(offset),
    });

    const response = await fetch(
      `https://api.convoso.com/v1/leads/search?${params.toString()}`,
      { method: "GET", headers: { "Content-Type": "application/json" } },
    );

    if (!response.ok) {
      console.error(`Convoso API error ${response.status}: ${await response.text()}`);
      break;
    }

    const json = (await response.json()) as {
      success: boolean;
      data?: {
        entries: Array<ConvosoApiLead>;
        total: number;
      };
    };

    if (!json.success || !json.data?.entries?.length) break;

    allLeads.push(...json.data.entries);

    if (allLeads.length >= json.data.total || json.data.entries.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  if (!allLeads.length) {
    console.log("Cron sync: no recent leads");
    return;
  }

  // 2. Load phone cache from a SINGLE KV key (persisted across ticks).
  //    This avoids per-phone KV puts that blew past the 1,000 puts/day free tier.
  const rawPhoneCache = await env.CACHE.get<Record<string, string>>("crm:phone-cache", "json");
  const phoneCache = new Map<string, string | null>();
  if (rawPhoneCache) {
    for (const [k, v] of Object.entries(rawPhoneCache)) {
      phoneCache.set(k, v || null);
    }
  }
  const phoneCacheInitialSize = phoneCache.size;

  const notesCache = new Set<string>(); // personIds known to have notes

  let totalSynced = 0;
  for (const apiLead of allLeads) {
    try {
      await syncConvosoApiLead(env, apiLead, phoneCache, notesCache);
      totalSynced++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Cron sync failed for lead ${apiLead.lead_id}: ${message}`);
      if (message.includes("subrequests")) break;
    }
  }

  // Persist phone cache as a single KV key only if new phones were discovered.
  // This throttles writes to ~10-20/day instead of thousands.
  if (phoneCache.size > phoneCacheInitialSize) {
    const obj: Record<string, string> = {};
    for (const [k, v] of phoneCache.entries()) {
      if (v) obj[k] = v; // Only persist known person IDs, skip nulls
    }
    await env.CACHE.put("crm:phone-cache", JSON.stringify(obj), { expirationTtl: 900 });
  }

  console.log(`Cron sync complete: ${totalSynced}/${allLeads.length} leads synced`);
};

const syncRecentCalls = async (env: Env): Promise<void> => {
  const now = new Date();
  // Look back 2 hours — plenty of buffer for missed ticks. Batch dedup keeps
  // this cheap (only truly new calls trigger CRM writes).
  const since = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  // Pre-warm caches
  await resolveConvosoListName(env, "0");
  await resolveConvosoUserName(env, "0");

  // 1. Fetch ALL calls from Convoso with pagination (old code capped at 100)
  const allResults: ConvosoCallLog[] = [];
  let offset = 0;
  const PAGE_SIZE = 500;

  while (true) {
    const params = new URLSearchParams({
      auth_token: env.CONVOSO_API_TOKEN,
      start_time: toConvosoDate(since),
      end_time: toConvosoDate(now),
      limit: String(PAGE_SIZE),
      offset: String(offset),
      include_recordings: "1",
    });

    const response = await fetch(
      `https://api.convoso.com/v1/log/retrieve?${params.toString()}`,
      { headers: { "Content-Type": "application/json" } },
    );

    if (!response.ok) {
      console.error(`Convoso call log API error ${response.status}: ${await response.text()}`);
      break;
    }

    const json = (await response.json()) as {
      success: boolean;
      data?: {
        results: Array<ConvosoCallLog>;
        total_found: number;
      };
    };

    if (!json.success || !json.data?.results?.length) break;

    allResults.push(...json.data.results);

    // Stop when we have everything or hit the last page
    if (allResults.length >= json.data.total_found || json.data.results.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  if (!allResults.length) {
    console.log("Cron call sync: no recent calls");
    return;
  }

  // 2. Filter out in-progress and system calls upfront
  const eligibleCalls = allResults.filter(
    (c) =>
      c.term_reason && c.term_reason !== "NONE" &&
      !(c.user_id && SYSTEM_USER_IDS.has(c.user_id)),
  );

  // 3. Batch dedup: fetch all convosoCallIds already in the CRM for the same
  //    window we fetched from Convoso (must match to avoid duplicates)
  const existingCallIds = await fetchExistingConvosoCallIds(env, since);
  const newCalls = eligibleCalls.filter((c) => !existingCallIds.has(c.id));

  console.log(
    `Cron call sync: ${allResults.length} fetched, ${eligibleCalls.length} eligible, ${newCalls.length} new (${existingCallIds.size} already synced)`,
  );

  if (!newCalls.length) return;

  // 4. In-memory phone→personId cache to avoid repeated CRM lookups for the same number
  const phoneCache = new Map<string, string | null>();

  let totalSynced = 0;
  for (const callLog of newCalls) {
    try {
      // Resolve person by phone (with in-memory cache)
      const phone = normalizePhone(callLog.phone_number);
      let leadId: string | null = null;
      if (phone) {
        if (phoneCache.has(phone.number)) {
          leadId = phoneCache.get(phone.number)!;
        } else {
          leadId = await findPersonByPhone(env, phone.number);
          phoneCache.set(phone.number, leadId);
        }
      }

      // Resolve agent
      let agentId: string | null = null;
      let agentName: string | null = null;
      if (callLog.user_id && !SYSTEM_USER_IDS.has(callLog.user_id)) {
        agentName = await resolveConvosoUserName(env, callLog.user_id);
        if (agentName) {
          agentId = await findAgentProfileByName(env, agentName);
        }
      }

      // Resolve lead source from list_id
      let leadSourceId: string | null = null;
      let sourceName: string | null = null;
      if (callLog.list_id) {
        sourceName = await resolveConvosoListName(env, callLog.list_id);
        if (sourceName) {
          leadSourceId = await findOrCreateLeadSource(env, sourceName);
        }
      }

      // Build queue label for call name: queue → lead source → campaign → agent → phone
      const queueLabel = callLog.queue || sourceName || callLog.campaign || agentName || callLog.phone_number || "Unknown";

      // Build call input from log entry
      const callInput = await buildCallInputFromLog(env, callLog, leadId, agentId, leadSourceId, queueLabel, sourceName);
      await createCall(env, callInput);
      totalSynced++;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Cron call sync failed for call ${callLog.id}: ${message}`);
      if (message.includes("subrequests")) break;
    }
  }

  console.log(`Cron call sync complete: ${totalSynced}/${newCalls.length} new calls synced`);
};

// ─── Lead Report Policy Sync ─────────────────────────────────────────────────

const syncRecentPolicies = async (env: Env): Promise<void> => {
  if (!env.OLD_CRM_BASE_URL) {
    return;
  }

  // Load synced policy IDs (old policy_id -> CRM UUID)
  const syncedIds = await loadSyncedPolicyIds(env);
  const initialSize = syncedIds.size;

  // In-memory caches for carrier/product/agent lookups
  const carrierCache = new Map<string, string | null>();
  const productCache = new Map<string, string | null>();
  const agentCache = new Map<string, string | null>();

  let totalCreated = 0;
  let totalUpdated = 0;
  let processed = 0;

  // ── Mode A: Incremental (newest-first) ──
  // Fetch the first few pages to catch new policies since last tick
  for (let page = 1; page <= POLICY_INCREMENTAL_PAGES; page++) {
    if (processed >= POLICY_BATCH_LIMIT) break;

    const result = await fetchLeadReportPage(env, page, POLICY_PAGE_SIZE);
    if (!result?.response?.data?.length) break;

    let hitWatermark = false;
    for (const policy of result.response.data) {
      if (processed >= POLICY_BATCH_LIMIT) break;

      const oldId = String(policy.policy_id);
      if (!oldId) continue;

      if (syncedIds.has(oldId)) {
        // We've seen this policy before — we've caught up
        hitWatermark = true;
        break;
      }

      // Check if already in CRM (handles KV map loss / first run)
      const existing = await findPolicyByOldId(env, oldId);
      if (existing) {
        syncedIds.set(oldId, existing.id);
        continue;
      }

      // New policy — find person by phone
      const phone = normalizePhone(policy.phone);
      let personId: string | null = null;
      if (phone) {
        personId = await findPersonByPhone(env, phone.number);
      }
      if (!personId) continue;

      try {
        const policyInput = await buildPolicyInputFromReport(
          env, policy, personId, carrierCache, productCache, agentCache,
        );
        const created = await createPolicy(env, policyInput);
        syncedIds.set(oldId, created.id);
        totalCreated++;
        processed++;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(`Policy sync (incremental): failed for ${oldId}: ${message}`);
        if (message.includes("subrequests")) break;
      }
    }

    if (hitWatermark) break;
  }

  // ── Mode B: Backfill/Update (rotating cursor) ──
  // Advance through the full dataset to catch updates and backfill old policies
  const cursorKey = "sync:policy-cursor-page";
  const rawCursor = await env.CACHE.get(cursorKey);
  let cursorPage = rawCursor ? parseInt(rawCursor, 10) : 1;
  if (isNaN(cursorPage) || cursorPage < 1) cursorPage = 1;

  for (let i = 0; i < POLICY_BACKFILL_PAGES; i++) {
    if (processed >= POLICY_BATCH_LIMIT) break;

    const result = await fetchLeadReportPage(env, cursorPage, POLICY_PAGE_SIZE);
    if (!result?.response?.data?.length) {
      // Reached the end — wrap around
      cursorPage = 1;
      break;
    }

    for (const policy of result.response.data) {
      if (processed >= POLICY_BATCH_LIMIT) break;

      const oldId = String(policy.policy_id);
      if (!oldId) continue;

      const existingUuid = syncedIds.get(oldId);

      if (existingUuid) {
        // Existing policy — check for status/premium changes
        const newStatus = policy.status_name
          ? POLICY_STATUS_NAME_MAP[policy.status_name.toLowerCase()]
          : undefined;
        const newPremium = policy.total_premium ? parseFloat(policy.total_premium) : undefined;

        const updateInput: Record<string, unknown> = {};
        if (newStatus) {
          updateInput.status = newStatus;
        }
        if (newPremium !== undefined && !isNaN(newPremium)) {
          updateInput.premium = {
            amountMicros: Math.round(newPremium * 1_000_000),
            currencyCode: "USD",
          };
        }

        if (Object.keys(updateInput).length > 0) {
          try {
            await updatePolicy(env, existingUuid, updateInput);
            totalUpdated++;
            processed++;
          } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            console.error(`Policy sync (backfill update): failed for ${oldId}: ${message}`);
            if (message.includes("subrequests")) break;
          }
        }
      } else {
        // New policy in backfill — check CRM first (handles KV map loss)
        const existing = await findPolicyByOldId(env, oldId);
        if (existing) {
          syncedIds.set(oldId, existing.id);
          continue;
        }

        const phone = normalizePhone(policy.phone);
        let personId: string | null = null;
        if (phone) {
          personId = await findPersonByPhone(env, phone.number);
        }
        if (!personId) continue;

        try {
          const policyInput = await buildPolicyInputFromReport(
            env, policy, personId, carrierCache, productCache, agentCache,
          );
          const created = await createPolicy(env, policyInput);
          syncedIds.set(oldId, created.id);
          totalCreated++;
          processed++;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          console.error(`Policy sync (backfill create): failed for ${oldId}: ${message}`);
          if (message.includes("subrequests")) break;
        }
      }
    }

    cursorPage++;
    // Wrap around if past last page
    if (result.response && cursorPage > result.response.total_page) {
      cursorPage = 1;
    }
  }

  // Persist cursor and synced IDs
  await env.CACHE.put(cursorKey, String(cursorPage));
  if (syncedIds.size > initialSize || totalUpdated > 0) {
    await saveSyncedPolicyIds(env, syncedIds);
  }

  console.log(`Policy sync complete: ${totalCreated} created, ${totalUpdated} updated (${processed} processed, ${syncedIds.size} total tracked)`);
};

// ─── Worker export ──────────────────────────────────────────────────────────

export default {
  fetch: async (request: Request, env: Env): Promise<Response> => {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }

    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const url = new URL(request.url);

    // Validate shared secret (header or query param)
    const secret =
      request.headers.get("x-webhook-secret") ||
      url.searchParams.get("secret");
    if (secret !== env.WEBHOOK_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (url.pathname === "/lead") {
      return handleLead(request, env);
    }

    if (url.pathname === "/call") {
      return handleCall(request, env);
    }

    return Response.json({ error: "Not found" }, { status: 404 });
  },

  scheduled: async (controller: ScheduledController, env: Env, _ctx: ExecutionContext): Promise<void> => {
    // Each cron fires as a separate Worker invocation with its own subrequest budget.
    // "* * * * *"   → calls  (every 1 min)
    // "*/2 * * * *" → leads  (every 2 min)
    // "*/5 * * * *" → policies (every 5 min)
    const cron = controller.cron;
    try {
      if (cron === "* * * * *") {
        await syncRecentCalls(env);
      } else if (cron === "*/2 * * * *") {
        await syncRecentLeads(env);
      } else if (cron === "*/5 * * * *") {
        await syncRecentPolicies(env);
      }
    } catch (err) {
      console.error(`Cron ${cron} error: ${err instanceof Error ? err.message : err}`);
    }
  },
} satisfies ExportedHandler<Env>;
