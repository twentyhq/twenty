import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In, IsNull } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { extractDomainFromLink } from 'src/modules/contact-creation-manager/utils/extract-domain-from-link.util';
import { SYSTEM_ACTOR } from 'src/modules/enso/company-enrichment/company-enrichment.constants';
import {
  COMPANY_RELATION_REASSIGNMENTS,
  COMPANY_SCALAR_BACKFILL_FIELDS,
  normalizeRegistrationNumber,
} from 'src/modules/enso/company-merge/company-merge.constants';
import { buildMergeTimelineActivityInsert } from 'src/modules/enso/record-merge/merge-timeline.util';

// Full company row (getRepository<any> returns all columns, including the custom
// enrichment fields). Composites come back nested.
type CompanyRow = Record<string, any> & {
  id: string;
  createdAt: Date;
  domainName?: { primaryLinkUrl?: string | null } | null;
  address?: Record<string, any> | null;
  companyPhone?: { primaryPhoneNumber?: string | null } | null;
  linkedinLink?: { primaryLinkUrl?: string | null } | null;
  xLink?: { primaryLinkUrl?: string | null } | null;
  annualRecurringRevenue?: { amountMicros?: number | null } | null;
};

// Merges a set of duplicate companies into the OLDEST record (the keeper):
//   reassign every company-FK relation off the duplicates → keeper,
//   backfill the keeper's empty fields from a duplicate,
//   soft-delete the duplicates.
// Idempotent: re-running with an already-merged set is a no-op (the duplicates
// are gone). Relation reassignments are best-effort so a unique-constraint clash
// on one junction (e.g. two opportunities for the same person×company) can't
// strand the whole merge.
@Injectable()
export class CompanyMergeExecutorService {
  private readonly logger = new Logger(CompanyMergeExecutorService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async mergeDuplicates(
    authContext: WorkspaceAuthContext,
    companyIds: string[],
  ): Promise<{ keeperId: string; mergedIds: string[] } | null> {
    const workspaceId = authContext.workspace?.id;

    if (!workspaceId || companyIds.length < 2) {
      return null;
    }

    const systemAuthContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const companyRepository =
          await this.globalWorkspaceOrmManager.getRepository<any>(
            workspaceId,
            'company',
            { shouldBypassPermissionChecks: true },
          );

        const companies: CompanyRow[] = await companyRepository.find({
          where: { id: In(companyIds), deletedAt: IsNull() },
          order: { createdAt: 'ASC' },
        });

        // Need at least two live records to merge.
        if (companies.length < 2) {
          return null;
        }

        const keeper = companies[0]; // oldest
        const duplicates = companies.slice(1);
        const duplicateIds = duplicates.map((duplicate) => duplicate.id);

        // 1) Re-point every company-FK relation from the duplicates to the keeper.
        // These FKs are flat columns on the related objects, not composites.
        for (const { object, field } of COMPANY_RELATION_REASSIGNMENTS) {
          try {
            const repository =
              await this.globalWorkspaceOrmManager.getRepository<any>(
                workspaceId,
                object,
                { shouldBypassPermissionChecks: true },
              );

            await repository.update(
              { [field]: In(duplicateIds) },
              { [field]: keeper.id, updatedBy: SYSTEM_ACTOR },
            );
          } catch (error) {
            this.logger.warn(
              `Reassign ${object}.${field} → keeper ${keeper.id} failed: ${
                (error as Error).message
              }`,
            );
          }
        }

        // 2) Backfill the keeper's empty fields from a duplicate.
        const patch = this.buildBackfillPatch(keeper, duplicates);

        if (Object.keys(patch).length > 0) {
          patch.updatedBy = SYSTEM_ACTOR;
          await companyRepository.update({ id: keeper.id }, patch);
        }

        // 3) Soft-delete the merged-away duplicates.
        for (const duplicate of duplicates) {
          try {
            await companyRepository.softDelete({ id: duplicate.id });
          } catch (error) {
            this.logger.warn(
              `Soft-delete duplicate company ${duplicate.id} failed: ${
                (error as Error).message
              }`,
            );
          }
        }

        // 4) Surface the merge on the keeper's timeline (best-effort).
        try {
          const timelineRepository =
            await this.globalWorkspaceOrmManager.getRepository<any>(
              workspaceId,
              'timelineActivity',
              { shouldBypassPermissionChecks: true },
            );

          await timelineRepository.insert(
            buildMergeTimelineActivityInsert({
              targetObject: 'company',
              keeperId: keeper.id,
              matchedOn: this.deriveMatchedOn(keeper, duplicates),
              mergedLabels: duplicates.map((duplicate) =>
                this.companyLabel(duplicate),
              ),
            }),
          );
        } catch (error) {
          this.logger.warn(
            `Merge timeline write failed for company ${keeper.id}: ${
              (error as Error).message
            }`,
          );
        }

        this.logger.log(
          `Merged ${duplicateIds.length} duplicate(s) into company ${keeper.id}.`,
        );

        return { keeperId: keeper.id, mergedIds: duplicateIds };
      },
      systemAuthContext,
    );
  }

  private buildBackfillPatch(
    keeper: CompanyRow,
    duplicates: CompanyRow[],
  ): Record<string, any> {
    const patch: Record<string, any> = {};

    // Scalar fields: fill when the keeper's is empty.
    for (const field of COMPANY_SCALAR_BACKFILL_FIELDS) {
      const current = keeper[field];
      const isEmpty =
        current === null ||
        current === undefined ||
        (typeof current === 'string' && current.length === 0);

      if (!isEmpty) {
        continue;
      }

      const donor = duplicates.find((duplicate) => {
        const value = duplicate[field];

        return (
          isDefined(value) && !(typeof value === 'string' && value.length === 0)
        );
      });

      if (donor) {
        patch[field] = donor[field];
      }
    }

    // Composite fields: fill the whole composite when the keeper's primary slot
    // is empty (written nested).
    if (!keeper.domainName?.primaryLinkUrl) {
      const donor = duplicates.find((d) => d.domainName?.primaryLinkUrl);

      if (donor) patch.domainName = donor.domainName;
    }

    if (!keeper.companyPhone?.primaryPhoneNumber) {
      const donor = duplicates.find((d) => d.companyPhone?.primaryPhoneNumber);

      if (donor) patch.companyPhone = donor.companyPhone;
    }

    if (!keeper.linkedinLink?.primaryLinkUrl) {
      const donor = duplicates.find((d) => d.linkedinLink?.primaryLinkUrl);

      if (donor) patch.linkedinLink = donor.linkedinLink;
    }

    if (!keeper.xLink?.primaryLinkUrl) {
      const donor = duplicates.find((d) => d.xLink?.primaryLinkUrl);

      if (donor) patch.xLink = donor.xLink;
    }

    if (!keeper.annualRecurringRevenue?.amountMicros) {
      const donor = duplicates.find(
        (d) => d.annualRecurringRevenue?.amountMicros,
      );

      if (donor) patch.annualRecurringRevenue = donor.annualRecurringRevenue;
    }

    if (!keeper.address?.addressCity && !keeper.address?.addressStreet1) {
      const donor = duplicates.find(
        (d) => d.address?.addressCity || d.address?.addressStreet1,
      );

      if (donor) patch.address = donor.address;
    }

    return patch;
  }

  // Best-effort: which identity key the duplicates shared with the keeper, for
  // the timeline summary. Falls back to the generic combined label.
  private deriveMatchedOn(
    keeper: CompanyRow,
    duplicates: CompanyRow[],
  ): string {
    const keeperReg = normalizeRegistrationNumber(keeper.registrationNumber);
    const keeperDomain = this.companyDomain(keeper);

    const byReg =
      keeperReg.length > 0 &&
      duplicates.some(
        (d) => normalizeRegistrationNumber(d.registrationNumber) === keeperReg,
      );
    const byDomain =
      keeperDomain.length > 0 &&
      duplicates.some((d) => this.companyDomain(d) === keeperDomain);

    if (byReg && byDomain) return 'registration number/domain';
    if (byReg) return 'registration number';
    if (byDomain) return 'domain';

    return 'registration number/domain';
  }

  private companyDomain(company: CompanyRow): string {
    return company.domainName?.primaryLinkUrl
      ? extractDomainFromLink(company.domainName.primaryLinkUrl)
      : '';
  }

  // Human identifier of a merged-away company for the timeline row.
  private companyLabel(company: CompanyRow): string {
    return (
      company.name ||
      this.companyDomain(company) ||
      company.registrationNumber ||
      company.id
    );
  }
}
