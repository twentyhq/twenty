import { Injectable, Logger } from '@nestjs/common';

import { IngestionPipelineEntity } from 'src/engine/metadata-modules/ingestion-pipeline/entities/ingestion-pipeline.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

type OldCrmPolicyPayload = Record<string, unknown> & {
  policy_id?: string | number;
  policy_number?: string;
  phone?: string;
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

@Injectable()
export class OldCrmPolicyPreprocessor {
  private readonly logger = new Logger(OldCrmPolicyPreprocessor.name);

  // In-memory caches to avoid repeated DB lookups within a single cron run
  private carrierCache = new Map<string, string | null>();
  private productCache = new Map<string, string | null>();
  private agentCache = new Map<string, string | null>();
  private leadSourceCache = new Map<string, string | null>();

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async preProcess(
    payload: OldCrmPolicyPayload,
    _pipeline: IngestionPipelineEntity,
    workspaceId: string,
  ): Promise<Record<string, unknown> | null> {
    // Filter out records where reg_date is not today (Eastern time)
    if (!this.isToday(payload.reg_date)) {
      return null;
    }

    this.logger.log(
      `Preprocessing old CRM policy ${payload.policy_id}`,
    );

    // Resolve lead source from vendor_name (needed before person creation)
    const leadSourceId = payload.vendor_name
      ? await this.findOrCreateLeadSource(payload.vendor_name, workspaceId)
      : null;

    // Find person by phone
    const normalizedPhone = this.normalizePhone(payload.phone);
    const personId = await this.findOrCreatePersonByPhone(
      normalizedPhone,
      leadSourceId,
      workspaceId,
    );

    if (!personId) {
      this.logger.warn(
        `No person found for policy ${payload.policy_id} (phone: ${payload.phone})`,
      );

      return null;
    }

    // Resolve carrier
    const carrierId = payload.carrier_name
      ? await this.findOrCreateCarrier(payload.carrier_name, workspaceId)
      : null;

    // Resolve product
    const productId = payload.product_name
      ? await this.findOrCreateProduct(payload.product_name, workspaceId)
      : null;

    // Resolve agent by name (fuzzy)
    const agentId = payload.member_name
      ? await this.findAgentByName(payload.member_name, workspaceId)
      : null;

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
    };
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

  private async findOrCreatePersonByPhone(
    normalizedPhone: string | null,
    leadSourceId: string | null,
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

      // Set leadSource on existing person if not already set
      if (leadSourceId && !existingRecord.leadSourceId) {
        try {
          await personRepo.update(existingId, {
            leadSourceId,
          });
          this.logger.log(
            `Updated Person ${existingId} with leadSourceId ${leadSourceId}`,
          );
        } catch (error) {
          this.logger.warn(
            `Failed to update leadSourceId on Person ${existingId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
        }
      }

      return existingId;
    }

    // Create minimal person from phone, with leadSource if available
    try {
      const personData: Record<string, unknown> = {
        phones: {
          primaryPhoneNumber: normalizedPhone,
          primaryPhoneCallingCode: '+1',
          primaryPhoneCountryCode: 'US',
        },
        name: {
          firstName: '',
          lastName: '',
        },
      };

      if (leadSourceId) {
        personData.leadSourceId = leadSourceId;
      }

      const created = await personRepo.save(personData);
      const createdId = (created as Record<string, unknown>).id as string;

      this.logger.log(
        `Created Person ${createdId} from old CRM phone ${normalizedPhone}`,
      );

      return createdId;
    } catch (error) {
      this.logger.error(
        `Failed to create Person for phone ${normalizedPhone}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      return null;
    }
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

    const searchLower = trimmedName.toLowerCase();
    const matched = agents.find((agent) => {
      const agentName = ((agent.name as Record<string, string>)?.firstName +
        ' ' +
        (agent.name as Record<string, string>)?.lastName)
        .trim()
        .toLowerCase();

      return agentName.includes(searchLower) || searchLower.includes(agentName);
    });

    const id = matched ? (matched.id as string) : null;

    this.agentCache.set(trimmedName, id);

    return id;
  }
}
