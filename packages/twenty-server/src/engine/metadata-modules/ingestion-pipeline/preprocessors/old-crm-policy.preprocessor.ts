import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { IngestionPipelineEntity } from 'src/engine/metadata-modules/ingestion-pipeline/entities/ingestion-pipeline.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { lookupCarrierProductCommission } from 'src/modules/policy/utils/lookup-carrier-product-commission.util';

type OldCrmPolicyPayload = Record<string, unknown> & {
  policy_id?: string | number;
  policy_number?: string;
  lead_id?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  city?: string;
  state_name?: string;
  zipcode?: string;
  carrier_name?: string;
  product_name?: string;
  member_name?: string;
  status_name?: string;
  total_premium?: string;
  effective_date?: string;
  expires_date?: string;
  reg_date?: string;
  vendor_name?: string;
};

const POLICY_STATUS_NAME_MAP: Record<string, string> = {
  submitted: 'SUBMITTED',
  pending: 'PENDING',
  declined: 'DECLINED',
  canceled: 'CANCELED',
  incomplete: 'INCOMPLETE',
  'active / approved': 'ACTIVE_APPROVED',
  'active/approved': 'ACTIVE_APPROVED',
  'active / placed': 'ACTIVE_PLACED',
  'active/placed': 'ACTIVE_PLACED',
  'payment error - canceled': 'PAYMENT_ERROR_CANCELED',
  'payment error - active/approved': 'PAYMENT_ERROR_ACTIVE_APPROVED',
  'payment error - active/placed': 'PAYMENT_ERROR_ACTIVE_PLACED',
};

const CONTACT_STATUS_MAP: Record<string, string> = {
  '1': 'IDLE',
  '2': 'CONTACTED',
  '3': 'SOLD',
  '4': 'SOLD',
  '5': 'IDLE',
};

const GENDER_MAP: Record<string, string> = {
  M: 'MALE',
  F: 'FEMALE',
};

const FAMILY_TYPE_MAP: Record<string, string> = {
  D: 'DEPENDENT',
  S: 'SPOUSE',
  C: 'DEPENDENT',
};

const STATE_ID_MAP: Record<string, string> = {
  '2': 'Alabama',
  '3': 'Alaska',
  '4': 'Arizona',
  '5': 'Arkansas',
  '6': 'California',
  '7': 'Colorado',
  '8': 'Connecticut',
  '9': 'Delaware',
  '10': 'Florida',
  '11': 'Georgia',
  '12': 'Hawaii',
  '13': 'Idaho',
  '14': 'Illinois',
  '15': 'Indiana',
  '16': 'Iowa',
  '17': 'Kansas',
  '18': 'Kentucky',
  '19': 'Louisiana',
  '20': 'Maine',
  '21': 'Maryland',
  '22': 'Massachusetts',
  '23': 'Michigan',
  '24': 'Minnesota',
  '25': 'Mississippi',
  '26': 'Missouri',
  '27': 'Montana',
  '28': 'Nebraska',
  '29': 'Nevada',
  '30': 'New Hampshire',
  '31': 'New Jersey',
  '32': 'New Mexico',
  '33': 'New York',
  '34': 'North Carolina',
  '35': 'North Dakota',
  '36': 'Ohio',
  '37': 'Oklahoma',
  '38': 'Oregon',
  '39': 'Pennsylvania',
  '40': 'Rhode Island',
  '41': 'South Carolina',
  '42': 'South Dakota',
  '43': 'Tennessee',
  '44': 'Texas',
  '45': 'Utah',
  '46': 'Vermont',
  '47': 'Virginia',
  '48': 'Washington',
  '49': 'West Virginia',
  '50': 'Wisconsin',
  '51': 'Wyoming',
};

const JUNK_EMAILS = new Set([
  'none@none.com',
  'test@test.com',
  'n/a@n/a.com',
  'na@na.com',
  'noemail@noemail.com',
  'no@email.com',
  'none@gmail.com',
  'none@email.com',
  'fake@fakemail.com',
  'none@noemail.com',
]);

@Injectable()
export class OldCrmPolicyPreprocessor {
  private readonly logger = new Logger(OldCrmPolicyPreprocessor.name);

  // In-memory caches to avoid repeated DB lookups within a single cron run
  private carrierCache = new Map<string, string | null>();
  private productCache = new Map<string, string | null>();
  private agentCache = new Map<string, string | null>();
  private leadSourceCache = new Map<string, string | null>();
  private leadDetailCache = new Map<string, Record<string, unknown> | null>();

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async preProcess(
    payload: OldCrmPolicyPayload,
    pipeline: IngestionPipelineEntity,
    workspaceId: string,
  ): Promise<Record<string, unknown> | null> {
    // Filter out records where reg_date is not today (Eastern time)
    if (!this.isToday(payload.reg_date)) {
      return null;
    }

    this.logger.log(`Preprocessing old CRM policy ${payload.policy_id}`);

    // Cross-reference dedup: skip if a policy already exists where
    // applicationId matches the incoming policy_number (agents sometimes
    // enter the HealthSherpa application ID as the policy number in the
    // old CRM, so the standard policyNumber dedup misses it).
    if (payload.policy_number) {
      const existingByAppId = await this.findPolicyByApplicationId(
        payload.policy_number,
        workspaceId,
      );

      if (existingByAppId) {
        this.logger.log(
          `Skipping policy ${payload.policy_id}: policy_number "${payload.policy_number}" ` +
            `matches existing policy ${existingByAppId} by applicationId`,
        );

        return null;
      }
    }

    // Resolve lead source from vendor_name (needed before person creation)
    const leadSourceId = payload.vendor_name
      ? await this.findOrCreateLeadSource(payload.vendor_name, workspaceId)
      : null;

    // Resolve agent by name (fuzzy) — needed for both person and policy
    const agentId = payload.member_name
      ? await this.findAgentByName(payload.member_name, workspaceId)
      : null;

    if (payload.member_name && !agentId) {
      this.logger.warn(
        `Agent not found for member_name "${payload.member_name}" on policy ${payload.policy_id}`,
      );
    }

    // Fetch full lead details from old CRM for richer person data
    const leadDetails = payload.lead_id
      ? await this.fetchLeadDetails(payload.lead_id, pipeline)
      : null;

    // Find person by phone, creating with full details if needed
    const normalizedPhone = this.normalizePhone(payload.phone);
    const personId = await this.findOrCreatePersonByPhone(
      normalizedPhone,
      payload,
      leadDetails,
      leadSourceId,
      agentId,
      workspaceId,
    );

    if (!personId) {
      this.logger.warn(
        `No person found for policy ${payload.policy_id} (phone: ${payload.phone})`,
      );

      return null;
    }

    // Create family members from lead details
    if (leadDetails) {
      await this.createFamilyMembers(leadDetails, personId, workspaceId);
    }

    // Resolve carrier
    const carrierId = payload.carrier_name
      ? await this.findOrCreateCarrier(payload.carrier_name, workspaceId)
      : null;

    // Resolve product
    const productId = payload.product_name
      ? await this.findOrCreateProduct(payload.product_name, workspaceId)
      : null;

    // Look up LTV from CarrierProduct commission
    const ltvCommission = await lookupCarrierProductCommission(
      carrierId,
      productId,
      workspaceId,
      this.globalWorkspaceOrmManager,
    );

    // Map status
    const status = payload.status_name
      ? POLICY_STATUS_NAME_MAP[payload.status_name.toLowerCase()] || null
      : null;

    // Convert premium to micros
    let premiumMicros = 0;

    if (payload.total_premium) {
      const premium = parseFloat(payload.total_premium);

      if (!isNaN(premium) && premium > 0) {
        premiumMicros = Math.round(premium * 1_000_000);
      }
    }

    // Build display name
    const carrierName = payload.carrier_name?.trim() || '';
    const productName = payload.product_name?.trim() || '';
    let displayName: string;

    if (carrierName && productName) {
      displayName = `${carrierName} - ${productName}`;
    } else if (carrierName) {
      displayName = `${carrierName} - Unknown`;
    } else if (productName) {
      displayName = `Unknown - ${productName}`;
    } else {
      displayName = 'Policy';
    }

    // Parse dates
    const effectiveDate = this.parseDate(payload.effective_date);
    const expirationDate = this.parseDate(payload.expires_date);
    const submittedDate = this.parseDate(payload.reg_date);

    this.logger.log(
      `Policy ${payload.policy_number}: personId=${personId}, agentId=${agentId}, carrierId=${carrierId}, productId=${productId}`,
    );

    // leadSource is set directly on the person/lead, not on the policy
    return {
      ...payload,
      _personId: personId,
      _displayName: displayName,
      _premiumMicros: premiumMicros,
      _usd: 'USD',
      _status: status,
      _effectiveDate: effectiveDate,
      _expirationDate: expirationDate,
      _agentId: agentId,
      _carrierId: carrierId,
      _productId: productId,
      _submittedDate: submittedDate,
      _ltvAmountMicros: ltvCommission?.amountMicros ?? null,
      _ltvCurrencyCode: ltvCommission?.currencyCode ?? null,
    };
  }

  // Fetch full lead details from the old CRM API using the lead_id hash.
  // Returns enriched data including DOB, gender, address, family members.
  private async fetchLeadDetails(
    leadId: string,
    pipeline: IngestionPipelineEntity,
  ): Promise<Record<string, unknown> | null> {
    const cached = this.leadDetailCache.get(leadId);

    if (cached !== undefined) return cached;

    const headers = this.buildAuthHeaders(pipeline);

    if (!headers) {
      this.leadDetailCache.set(leadId, null);

      return null;
    }

    // Derive base URL from pipeline sourceUrl (e.g. .../lead-report-api -> .../)
    const baseUrl = this.getBaseUrl(pipeline.sourceUrl);

    if (!baseUrl) {
      this.leadDetailCache.set(leadId, null);

      return null;
    }

    try {
      const response = await fetch(`${baseUrl}/lead/details/${leadId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        this.logger.warn(
          `Lead details API returned ${response.status} for lead_id ${leadId}`,
        );
        this.leadDetailCache.set(leadId, null);

        return null;
      }

      const json = (await response.json()) as {
        status?: number;
        response?: { data?: Record<string, unknown> };
      };

      if (json.status !== 1 || !json.response?.data) {
        this.logger.warn(
          `Lead details API returned no data for lead_id ${leadId}`,
        );
        this.leadDetailCache.set(leadId, null);

        return null;
      }

      const detail = json.response.data;

      this.leadDetailCache.set(leadId, detail);
      this.logger.log(`Fetched lead details for ${leadId}`);

      return detail;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch lead details for ${leadId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.leadDetailCache.set(leadId, null);

      return null;
    }
  }

  private buildAuthHeaders(
    pipeline: IngestionPipelineEntity,
  ): Record<string, string> | null {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (!isDefined(pipeline.sourceAuthConfig)) {
      return null;
    }

    const auth = pipeline.sourceAuthConfig;

    switch (auth.type) {
      case 'bearer':
        headers['Authorization'] = `Bearer ${auth.token}`;
        break;
      case 'api_key':
        headers[auth.headerName] = auth.key;
        break;
      case 'basic': {
        const encoded = Buffer.from(
          `${auth.username}:${auth.password}`,
        ).toString('base64');

        headers['Authorization'] = `Basic ${encoded}`;
        break;
      }
      default:
        return null;
    }

    return headers;
  }

  private getBaseUrl(sourceUrl: string | null): string | null {
    if (!sourceUrl) return null;

    try {
      const url = new URL(sourceUrl);
      // Remove the last path segment (e.g. /lead-report-api)
      const pathParts = url.pathname.split('/').filter(Boolean);

      pathParts.pop();
      url.pathname = '/' + pathParts.join('/');

      return url.origin + url.pathname;
    } catch {
      return null;
    }
  }

  private async findOrCreatePersonByPhone(
    normalizedPhone: string | null,
    payload: OldCrmPolicyPayload,
    leadDetails: Record<string, unknown> | null,
    leadSourceId: string | null,
    agentId: string | null,
    workspaceId: string,
  ): Promise<string | null> {
    if (!normalizedPhone) {
      return null;
    }

    const personRepo = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      'person',
      { shouldBypassPermissionChecks: true },
    );

    const existing = await personRepo.findOne({
      where: {
        phones: {
          primaryPhoneNumber: normalizedPhone,
        },
      },
    });

    if (existing) {
      const existingRecord = existing as Record<string, unknown>;
      const existingId = existingRecord.id as string;

      // Enrich existing person if it has empty name
      const existingName = existingRecord.name as
        | Record<string, string>
        | undefined;
      const hasName =
        existingName?.firstName?.trim() || existingName?.lastName?.trim();

      if (!hasName) {
        const updates = this.buildPersonUpdates(
          payload,
          leadDetails,
          leadSourceId,
          agentId,
        );

        if (Object.keys(updates).length > 0) {
          try {
            await personRepo.update(existingId, updates);
            this.logger.log(`Enriched Person ${existingId} with lead details`);
          } catch (error) {
            this.logger.warn(
              `Failed to enrich Person ${existingId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
          }
        }
      } else {
        // Still update leadSource and agent if not already set
        const updates: Record<string, unknown> = {};

        if (leadSourceId && !existingRecord.leadSourceId) {
          updates.leadSourceId = leadSourceId;
        }

        if (agentId && !existingRecord.assignedAgentId) {
          updates.assignedAgentId = agentId;
        }

        if (Object.keys(updates).length > 0) {
          try {
            await personRepo.update(existingId, updates);
          } catch (error) {
            this.logger.warn(
              `Failed to update Person ${existingId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
          }
        }
      }

      return existingId;
    }

    // Fallback: try email lookup when phone didn't match
    // (handles cases where old CRM has a different phone for the same person)
    const email = ((leadDetails?.email as string) || payload.email || '')
      .trim()
      .toLowerCase();

    if (this.isValidEmail(email)) {
      const existingByEmail = await personRepo.findOne({
        where: {
          emails: {
            primaryEmail: email,
          },
        },
      });

      if (existingByEmail) {
        const existingRecord = existingByEmail as Record<string, unknown>;
        const existingId = existingRecord.id as string;
        const existingName = existingRecord.name as
          | Record<string, string>
          | undefined;

        const incomingFirst = (
          (leadDetails?.first_name as string) ||
          payload.first_name ||
          ''
        )
          .trim()
          .toLowerCase();
        const incomingLast = (
          (leadDetails?.last_name as string) ||
          payload.last_name ||
          ''
        )
          .trim()
          .toLowerCase();
        const existingFirst = (existingName?.firstName || '')
          .trim()
          .toLowerCase();
        const existingLast = (existingName?.lastName || '')
          .trim()
          .toLowerCase();

        if (existingLast === incomingLast && existingFirst === incomingFirst) {
          this.logger.log(
            `Found Person ${existingId} by email fallback (${email}), phone mismatch: expected ${normalizedPhone}`,
          );

          return existingId;
        }

        this.logger.warn(
          `Email fallback matched Person ${existingId} (${existingFirst} ${existingLast}) but name doesn't match incoming (${incomingFirst} ${incomingLast}) — skipping`,
        );
      }
    }

    // Create person with full details from lead API or policy payload
    try {
      const personData = this.buildPersonData(
        normalizedPhone,
        payload,
        leadDetails,
        leadSourceId,
        agentId,
      );

      const created = await personRepo.save(personData);
      const createdId = (created as Record<string, unknown>).id as string;
      const firstName = (personData.name as Record<string, string>)?.firstName;
      const lastName = (personData.name as Record<string, string>)?.lastName;

      this.logger.log(
        `Created Person ${createdId}: ${firstName} ${lastName} (${normalizedPhone})`,
      );

      return createdId;
    } catch (error) {
      this.logger.error(
        `Failed to create Person for phone ${normalizedPhone}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      return null;
    }
  }

  // Build a full person record from lead details (preferred) or policy payload (fallback)
  private buildPersonData(
    normalizedPhone: string,
    payload: OldCrmPolicyPayload,
    leadDetails: Record<string, unknown> | null,
    leadSourceId: string | null,
    agentId: string | null,
  ): Record<string, unknown> {
    // Prefer lead details for richer data, fall back to policy payload
    const firstName = (
      (leadDetails?.first_name as string) ||
      payload.first_name ||
      ''
    )
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const lastName = (
      (leadDetails?.last_name as string) ||
      payload.last_name ||
      ''
    )
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const email = (
      (leadDetails?.email as string) ||
      payload.email ||
      ''
    ).trim();

    const personData: Record<string, unknown> = {
      phones: {
        primaryPhoneNumber: normalizedPhone,
        primaryPhoneCallingCode: '+1',
        primaryPhoneCountryCode: 'US',
      },
      name: {
        firstName,
        lastName,
      },
    };

    // Email
    if (this.isValidEmail(email)) {
      personData.emails = { primaryEmail: email.toLowerCase() };
    }

    // Address — lead details have state_id, policy payload has state_name
    const city = ((leadDetails?.city as string) || payload.city || '').trim();
    const stateId = leadDetails?.state_id?.toString();
    const stateName =
      (stateId ? STATE_ID_MAP[stateId] : null) || payload.state_name || '';
    const zipcode = (
      (leadDetails?.zipcode as string) ||
      payload.zipcode ||
      ''
    ).trim();
    const address = ((leadDetails?.address as string) || '').trim();
    const addressOther = ((leadDetails?.address_other as string) || '').trim();

    if (city || stateName || zipcode || address) {
      const addr: Record<string, string> = {
        addressCountry: 'United States',
      };

      if (address && address.toLowerCase() !== 'null') {
        addr.addressStreet1 = address;
      }

      if (addressOther && addressOther.toLowerCase() !== 'null') {
        addr.addressStreet2 = addressOther;
      }

      if (city) addr.addressCity = city;
      if (stateName) addr.addressState = stateName;
      if (zipcode) addr.addressPostcode = zipcode;

      personData.addressCustom = addr;
    }

    // Date of birth (from lead details only)
    const dob = (leadDetails?.dob as string) || '';

    if (dob && dob !== '0000-00-00') {
      personData.dateOfBirth = dob.substring(0, 10);
    }

    // Gender (from lead details only)
    const genderCode = (leadDetails?.gender as string) || '';
    const gender = GENDER_MAP[genderCode];

    if (gender) {
      personData.gender = gender;
    }

    // Lead status from contact status
    const contactStatus = leadDetails?.contactstatus?.toString() || '1';
    let leadStatus = CONTACT_STATUS_MAP[contactStatus] || 'IDLE';

    // DNC flags
    if (contactStatus === '5') {
      personData.doNotCall = true;
      personData.doNotEmail = true;
    }

    // Agent
    if (agentId) {
      personData.assignedAgentId = agentId;

      if (leadStatus === 'IDLE') {
        leadStatus = 'ASSIGNED';
      }
    }

    personData.leadStatus = leadStatus;

    // Lead source
    if (leadSourceId) {
      personData.leadSourceId = leadSourceId;
    }

    return personData;
  }

  // Build update payload for enriching an existing person with empty name
  private buildPersonUpdates(
    payload: OldCrmPolicyPayload,
    leadDetails: Record<string, unknown> | null,
    leadSourceId: string | null,
    agentId: string | null,
  ): Record<string, unknown> {
    const updates: Record<string, unknown> = {};

    const firstName = (
      (leadDetails?.first_name as string) ||
      payload.first_name ||
      ''
    )
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const lastName = (
      (leadDetails?.last_name as string) ||
      payload.last_name ||
      ''
    )
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());

    if (firstName || lastName) {
      updates.name = { firstName, lastName };
    }

    const email = (
      (leadDetails?.email as string) ||
      payload.email ||
      ''
    ).trim();

    if (this.isValidEmail(email)) {
      updates.emails = { primaryEmail: email.toLowerCase() };
    }

    // Address
    const city = ((leadDetails?.city as string) || payload.city || '').trim();
    const stateId = leadDetails?.state_id?.toString();
    const stateName =
      (stateId ? STATE_ID_MAP[stateId] : null) || payload.state_name || '';
    const zipcode = (
      (leadDetails?.zipcode as string) ||
      payload.zipcode ||
      ''
    ).trim();
    const address = ((leadDetails?.address as string) || '').trim();
    const addressOther = ((leadDetails?.address_other as string) || '').trim();

    if (city || stateName || zipcode || address) {
      const addr: Record<string, string> = {
        addressCountry: 'United States',
      };

      if (address && address.toLowerCase() !== 'null') {
        addr.addressStreet1 = address;
      }

      if (addressOther && addressOther.toLowerCase() !== 'null') {
        addr.addressStreet2 = addressOther;
      }

      if (city) addr.addressCity = city;
      if (stateName) addr.addressState = stateName;
      if (zipcode) addr.addressPostcode = zipcode;

      updates.addressCustom = addr;
    }

    const dob = (leadDetails?.dob as string) || '';

    if (dob && dob !== '0000-00-00') {
      updates.dateOfBirth = dob.substring(0, 10);
    }

    const genderCode = (leadDetails?.gender as string) || '';
    const gender = GENDER_MAP[genderCode];

    if (gender) {
      updates.gender = gender;
    }

    if (leadSourceId) {
      updates.leadSourceId = leadSourceId;
    }

    if (agentId) {
      updates.assignedAgentId = agentId;
    }

    // Set lead status based on contact status or agent assignment
    const contactStatus = leadDetails?.contactstatus?.toString() || '';
    let leadStatus = contactStatus
      ? CONTACT_STATUS_MAP[contactStatus] || 'IDLE'
      : null;

    if (contactStatus === '5') {
      updates.doNotCall = true;
      updates.doNotEmail = true;
    }

    if (agentId && (!leadStatus || leadStatus === 'IDLE')) {
      leadStatus = 'ASSIGNED';
    }

    if (leadStatus) {
      updates.leadStatus = leadStatus;
    }

    return updates;
  }

  // Create family members from lead details
  private async createFamilyMembers(
    leadDetails: Record<string, unknown>,
    personId: string,
    workspaceId: string,
  ): Promise<void> {
    const family = leadDetails.lead_family as
      | Array<Record<string, unknown>>
      | undefined;

    if (!family || family.length === 0) {
      return;
    }

    let familyMemberRepo;

    try {
      familyMemberRepo = await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        'familyMember',
        { shouldBypassPermissionChecks: true },
      );
    } catch {
      // familyMember object might not exist in this workspace
      return;
    }

    for (const fm of family) {
      const fmFirstName = ((fm.first_name as string) || '').trim();
      const fmLastName = ((fm.last_name as string) || '').trim();
      const fullName = `${fmFirstName} ${fmLastName}`.trim() || 'Family Member';
      const fmDob = (fm.dob as string) || '';
      const fmTypeCode = (fm.family_type_id as string) || 'D';
      const memberType = FAMILY_TYPE_MAP[fmTypeCode] || 'DEPENDENT';

      const fmData: Record<string, unknown> = {
        name: fullName,
        memberType,
        leadId: personId,
      };

      if (fmDob && fmDob !== '0000-00-00') {
        fmData.dateOfBirth = fmDob.substring(0, 10);
      }

      try {
        await familyMemberRepo.save(fmData);
      } catch (error) {
        this.logger.warn(
          `Failed to create family member "${fullName}" for person ${personId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    }
  }

  private isValidEmail(email: string): boolean {
    if (!email) return false;

    const e = email.trim().toLowerCase();

    return e.includes('@') && e.includes('.') && !JUNK_EMAILS.has(e);
  }

  private isToday(regDate: string | undefined): boolean {
    if (!regDate || regDate === '0000-00-00') {
      return false;
    }

    // Get today's date in Eastern time (UTC-5)
    const now = new Date();
    const easternDate = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/New_York' }),
    );
    const todayStr = [
      easternDate.getFullYear(),
      String(easternDate.getMonth() + 1).padStart(2, '0'),
      String(easternDate.getDate()).padStart(2, '0'),
    ].join('-');

    // reg_date may be "YYYY-MM-DD" or "YYYY-MM-DD HH:MM:SS"
    const regDateStr = regDate.substring(0, 10);

    return regDateStr === todayStr;
  }

  private parseDate(dateStr: string | undefined): string | null {
    if (!dateStr || dateStr === '0000-00-00') {
      return null;
    }

    return dateStr.substring(0, 10);
  }

  private normalizePhone(phone: string | undefined): string | null {
    if (!phone) return null;

    const digits = phone.toString().replace(/\D/g, '');

    if (digits.length === 11 && digits.startsWith('1')) {
      return digits.slice(1);
    }

    return digits.length === 10 ? digits : null;
  }

  private async findOrCreateCarrier(
    name: string,
    workspaceId: string,
  ): Promise<string | null> {
    const trimmedName = name.trim();

    if (!trimmedName) return null;

    const cached = this.carrierCache.get(trimmedName);

    if (cached !== undefined) return cached;

    const carrierRepo = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      'carrier',
      { shouldBypassPermissionChecks: true },
    );

    const existing = await carrierRepo.findOne({
      where: { name: trimmedName },
    });

    if (existing) {
      const id = (existing as Record<string, unknown>).id as string;

      this.carrierCache.set(trimmedName, id);

      return id;
    }

    try {
      const created = await carrierRepo.save({ name: trimmedName });
      const id = (created as Record<string, unknown>).id as string;

      this.logger.log(`Created carrier: ${trimmedName}`);
      this.carrierCache.set(trimmedName, id);

      return id;
    } catch (error) {
      this.logger.error(
        `Failed to create carrier "${trimmedName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.carrierCache.set(trimmedName, null);

      return null;
    }
  }

  private async findOrCreateProduct(
    name: string,
    workspaceId: string,
  ): Promise<string | null> {
    const trimmedName = name.trim();

    if (!trimmedName) return null;

    const cached = this.productCache.get(trimmedName);

    if (cached !== undefined) return cached;

    const productRepo = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      'product',
      { shouldBypassPermissionChecks: true },
    );

    const existing = await productRepo.findOne({
      where: { name: trimmedName },
    });

    if (existing) {
      const id = (existing as Record<string, unknown>).id as string;

      this.productCache.set(trimmedName, id);

      return id;
    }

    try {
      const created = await productRepo.save({ name: trimmedName });
      const id = (created as Record<string, unknown>).id as string;

      this.logger.log(`Created product: ${trimmedName}`);
      this.productCache.set(trimmedName, id);

      return id;
    } catch (error) {
      this.logger.error(
        `Failed to create product "${trimmedName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.productCache.set(trimmedName, null);

      return null;
    }
  }

  private async findOrCreateLeadSource(
    name: string,
    workspaceId: string,
  ): Promise<string | null> {
    const trimmedName = name.trim();

    if (!trimmedName) return null;

    const cached = this.leadSourceCache.get(trimmedName);

    if (cached !== undefined) return cached;

    const leadSourceRepo = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      'leadSource',
      { shouldBypassPermissionChecks: true },
    );

    const existing = await leadSourceRepo.findOne({
      where: { name: trimmedName },
    });

    if (existing) {
      const id = (existing as Record<string, unknown>).id as string;

      this.leadSourceCache.set(trimmedName, id);

      return id;
    }

    try {
      const created = await leadSourceRepo.save({ name: trimmedName });
      const id = (created as Record<string, unknown>).id as string;

      this.logger.log(`Created Lead Source: ${trimmedName}`);
      this.leadSourceCache.set(trimmedName, id);

      return id;
    } catch (error) {
      this.logger.error(
        `Failed to create Lead Source "${trimmedName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.leadSourceCache.set(trimmedName, null);

      return null;
    }
  }

  private async findAgentByName(
    name: string,
    workspaceId: string,
  ): Promise<string | null> {
    const trimmedName = name.trim();

    if (!trimmedName) return null;

    const cached = this.agentCache.get(trimmedName);

    if (cached !== undefined) return cached;

    const agentRepo = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      'agentProfile',
      { shouldBypassPermissionChecks: true },
    );

    // Fuzzy match: find agents whose name contains the search string
    const agents = (await agentRepo.find()) as Array<Record<string, unknown>>;

    this.logger.log(
      `Agent lookup for "${trimmedName}": found ${agents.length} agent profiles`,
    );

    const searchLower = trimmedName.toLowerCase();
    const matched = agents.find((agent) => {
      // name is a plain string field, not a composite {firstName, lastName}
      const agentName = ((agent.name as string) || '').trim().toLowerCase();

      if (!agentName) return false;

      return agentName.includes(searchLower) || searchLower.includes(agentName);
    });

    const id = matched ? (matched.id as string) : null;

    if (!id) {
      const agentNames = agents
        .slice(0, 10)
        .map((a) => `"${(a.name as string) || ''}"`)
        .join(', ');

      this.logger.warn(
        `No agent match for "${trimmedName}" among [${agentNames}${agents.length > 10 ? '...' : ''}]`,
      );
    }

    this.agentCache.set(trimmedName, id);

    return id;
  }

  private async findPolicyByApplicationId(
    applicationId: string,
    workspaceId: string,
  ): Promise<string | null> {
    const policyRepo = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      'policy',
      { shouldBypassPermissionChecks: true },
    );

    const existing = await policyRepo.findOne({
      where: { applicationId },
    });

    if (isDefined(existing)) {
      return (existing as Record<string, unknown>).id as string;
    }

    return null;
  }
}
