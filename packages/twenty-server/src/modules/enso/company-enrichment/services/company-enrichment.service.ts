import { Inject, Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { extractDomainFromLink } from 'src/modules/contact-creation-manager/utils/extract-domain-from-link.util';
import {
  COMPANY_ENRICHMENT_STATUS,
  type CompanyEnrichmentStatus,
  normalizeIndustry,
  SYSTEM_ACTOR,
} from 'src/modules/enso/company-enrichment/company-enrichment.constants';
import {
  COMPANY_ENRICHMENT_PROVIDERS,
  type CompanyEnrichmentInput,
  type CompanyEnrichmentProvider,
  type PartialCompanyEnrichment,
} from 'src/modules/enso/company-enrichment/providers/company-enrichment-provider.interface';

// Default currency for the derived annualRecurringRevenue when a provider gives
// a bare revenue amount (ENSO operates in RO/MD; EUR is the common denominator).
const DEFAULT_REVENUE_CURRENCY = process.env.ENSO_DEFAULT_CURRENCY ?? 'EUR';

// Runs the provider chain for a single company and writes the merged result onto
// it. Idempotent and best-effort: a failed run sets enrichmentStatus = FAILED
// rather than throwing, so the BullMQ job doesn't infinitely retry on a bad row.
@Injectable()
export class CompanyEnrichmentService {
  private readonly logger = new Logger(CompanyEnrichmentService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @Inject(COMPANY_ENRICHMENT_PROVIDERS)
    private readonly providers: CompanyEnrichmentProvider[],
  ) {}

  // Returns true when the company ends up with a registration number (VAT/CUI/
  // IDNO) — the caller uses that to trigger a registration-based dedup pass,
  // since the enrichment write below bypasses the company.* GraphQL hooks.
  async enrichCompany(
    workspaceId: string,
    companyId: string,
  ): Promise<boolean> {
    if (!isDefined(workspaceId) || !isDefined(companyId)) {
      return false;
    }

    const systemAuthContext = buildSystemAuthContext(workspaceId);

    try {
      return await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const companyRepository =
            await this.globalWorkspaceOrmManager.getRepository<any>(
              workspaceId,
              'company',
              { shouldBypassPermissionChecks: true },
            );

          const company = await companyRepository.findOne({
            where: { id: companyId },
          });

          if (!company) {
            return false;
          }

          const domain = company.domainName?.primaryLinkUrl
            ? extractDomainFromLink(company.domainName.primaryLinkUrl)
            : undefined;

          if (!domain) {
            await companyRepository.update(
              { id: companyId },
              {
                enrichmentStatus: COMPANY_ENRICHMENT_STATUS.SKIPPED,
                updatedBy: SYSTEM_ACTOR,
              },
            );

            return false;
          }

          const { merged, sources } = await this.runProviderChain({
            domain,
            name: company.name || undefined,
            legalName: company.legalName || undefined,
            registrationNumber: company.registrationNumber || undefined,
          });

          const update = this.buildCompanyUpdate(company, merged);

          update.enrichmentStatus = this.deriveStatus(merged);
          update.enrichedAt = new Date();
          // Provenance for compliance (e.g. Apollo data is "internal use only"):
          // which providers contributed to this record. Only set when non-empty
          // so a no-op run doesn't blank an existing value.
          if (sources.length > 0) {
            update.enrichmentSource = sources.join(', ');
          }
          update.updatedBy = SYSTEM_ACTOR;

          await companyRepository.update({ id: companyId }, update);

          const finalRegistrationNumber =
            update.registrationNumber ?? company.registrationNumber;

          return (
            isDefined(finalRegistrationNumber) &&
            String(finalRegistrationNumber).length > 0
          );
        },
        systemAuthContext,
      );
    } catch (error) {
      this.logger.warn(
        `Company enrichment failed for ${companyId}: ${(error as Error).message}`,
      );
      await this.markFailed(workspaceId, companyId).catch(() => undefined);

      return false;
    }
  }

  // Cheap→rich chain. Each provider receives the accumulated result so far;
  // a later provider's non-empty value overrides an earlier one (see interface).
  // Returns the merged result plus the names of providers that actually
  // contributed at least one field (for enrichmentSource provenance).
  private async runProviderChain(
    initial: CompanyEnrichmentInput,
  ): Promise<{ merged: PartialCompanyEnrichment; sources: string[] }> {
    let merged: PartialCompanyEnrichment = {};
    let input: CompanyEnrichmentInput = { ...initial };
    const sources: string[] = [];

    for (const provider of this.providers) {
      if (!provider.isEnabled()) {
        continue;
      }

      let found: PartialCompanyEnrichment | null = null;

      try {
        found = await provider.enrich(input);
      } catch (error) {
        this.logger.debug(
          `Provider ${provider.providerName} threw for ${input.domain}: ${(error as Error).message}`,
        );
        continue;
      }

      if (!found || !this.hasNonEmptyValue(found)) {
        continue;
      }

      sources.push(provider.providerName);
      merged = this.mergeNonEmpty(merged, found);
      input = {
        ...input,
        name: merged.name ?? input.name,
        legalName: merged.legalName ?? input.legalName,
        registrationNumber:
          merged.registrationNumber ?? input.registrationNumber,
      };
    }

    return { merged, sources };
  }

  private hasNonEmptyValue(result: PartialCompanyEnrichment): boolean {
    return Object.values(result).some(
      (value) =>
        value !== null &&
        value !== undefined &&
        !(typeof value === 'string' && value.length === 0),
    );
  }

  // Later non-empty values override earlier ones.
  private mergeNonEmpty(
    base: PartialCompanyEnrichment,
    next: PartialCompanyEnrichment,
  ): PartialCompanyEnrichment {
    const result: PartialCompanyEnrichment = { ...base };

    for (const [key, value] of Object.entries(next)) {
      const isEmpty =
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.length === 0);

      if (!isEmpty) {
        (result as Record<string, unknown>)[key] = value;
      }
    }

    return result;
  }

  // Map the merged firmographics onto Company columns. Only sets a field when the
  // chain produced a value, so we never clobber existing data with blanks.
  private buildCompanyUpdate(
    company: Record<string, any>,
    merged: PartialCompanyEnrichment,
  ): Record<string, any> {
    const update: Record<string, any> = {};

    // Prefer a provider name over the domain-derived one the company was created
    // with, but never blank it out.
    if (isDefined(merged.name)) {
      update.name = merged.name;
    }
    if (isDefined(merged.legalName)) {
      update.legalName = merged.legalName;
    }
    if (isDefined(merged.registrationNumber)) {
      update.registrationNumber = merged.registrationNumber;
    }
    if (isDefined(merged.description)) {
      update.description = merged.description;
    }
    if (isDefined(merged.foundedYear)) {
      update.foundedYear = merged.foundedYear;
    }
    if (isDefined(merged.employees)) {
      update.employees = merged.employees;
    }

    const industry = normalizeIndustry(merged.industry);

    if (isDefined(industry)) {
      update.industry = industry;
    }

    // Composite fields — merge into what already exists so we don't drop the
    // city a different provider may have set.
    const address = this.buildAddress(company.address, merged);

    if (address) {
      update.address = address;
    }

    if (isDefined(merged.phone)) {
      update.companyPhone = { primaryPhoneNumber: merged.phone };
    }
    if (isDefined(merged.linkedinUrl)) {
      update.linkedinLink = { primaryLinkUrl: merged.linkedinUrl };
    }
    if (isDefined(merged.xUrl)) {
      update.xLink = { primaryLinkUrl: merged.xUrl };
    }
    if (isDefined(merged.annualRevenueAmount)) {
      update.annualRecurringRevenue = {
        amountMicros: Math.round(merged.annualRevenueAmount * 1_000_000),
        currencyCode: DEFAULT_REVENUE_CURRENCY,
      };
    }

    return update;
  }

  private buildAddress(
    current: Record<string, any> | null | undefined,
    merged: PartialCompanyEnrichment,
  ): Record<string, any> | null {
    const next: Record<string, any> = { ...(current ?? {}) };
    let changed = false;

    const map: [keyof PartialCompanyEnrichment, string][] = [
      ['addressCity', 'addressCity'],
      ['addressCountry', 'addressCountry'],
      ['addressState', 'addressState'],
      ['addressStreet1', 'addressStreet1'],
      ['addressPostcode', 'addressPostcode'],
    ];

    for (const [from, to] of map) {
      const value = merged[from];

      if (isDefined(value) && value !== '') {
        next[to] = value;
        changed = true;
      }
    }

    return changed ? next : null;
  }

  // ENRICHED when we got a "rich" firmographic; PARTIAL when only basics
  // (name/city) came back; FAILED when the chain produced nothing usable.
  private deriveStatus(
    merged: PartialCompanyEnrichment,
  ): CompanyEnrichmentStatus {
    const rich =
      isDefined(merged.legalName) ||
      isDefined(merged.industry) ||
      isDefined(merged.description) ||
      isDefined(merged.foundedYear) ||
      isDefined(merged.employees) ||
      isDefined(merged.registrationNumber) ||
      isDefined(merged.annualRevenueAmount);

    if (rich) {
      return COMPANY_ENRICHMENT_STATUS.ENRICHED;
    }

    const basic = isDefined(merged.name) || isDefined(merged.addressCity);

    return basic
      ? COMPANY_ENRICHMENT_STATUS.PARTIAL
      : COMPANY_ENRICHMENT_STATUS.FAILED;
  }

  private async markFailed(
    workspaceId: string,
    companyId: string,
  ): Promise<void> {
    const systemAuthContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const companyRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'company',
          { shouldBypassPermissionChecks: true },
        );

      await companyRepository.update(
        { id: companyId },
        {
          enrichmentStatus: COMPANY_ENRICHMENT_STATUS.FAILED,
          updatedBy: SYSTEM_ACTOR,
        },
      );
    }, systemAuthContext);
  }
}
