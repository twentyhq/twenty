import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { type LinksMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { extractDomainFromLink } from 'src/modules/contact-creation-manager/utils/extract-domain-from-link.util';
import { getAllCompanyDomains } from 'src/modules/company/utils/get-all-company-domains.util';

export type CompanyDomainPayload = {
  domainName?: Partial<LinksMetadata> | null;
};

type CandidateInput = {
  data: CompanyDomainPayload;
  excludeCompanyId?: string;
};

@Injectable()
export class CompanyDomainUniquenessValidator {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async validateForCreate({
    workspaceId,
    payloads,
    upsert,
  }: {
    workspaceId: string;
    payloads: CompanyDomainPayload[];
    upsert: boolean;
  }): Promise<void> {
    const candidates: CandidateInput[] = payloads.map((data) => ({ data }));

    if (upsert) {
      await this.attachUpsertExcludeIds({ workspaceId, candidates });
    }

    await this.run({ workspaceId, candidates });
  }

  async validateForUpdate({
    workspaceId,
    payloads,
  }: {
    workspaceId: string;
    payloads: { id: string; data: CompanyDomainPayload }[];
  }): Promise<void> {
    const candidates: CandidateInput[] = payloads
      .filter((p) => isDefined(p.data?.domainName))
      .map((p) => ({ data: p.data, excludeCompanyId: p.id }));

    if (candidates.length === 0) {
      return;
    }

    await this.run({ workspaceId, candidates });
  }

  private async run({
    workspaceId,
    candidates,
  }: {
    workspaceId: string;
    candidates: CandidateInput[];
  }): Promise<void> {
    const expanded = candidates
      .map((c) => ({
        domains: getAllCompanyDomains(c.data.domainName),
        excludeCompanyId: c.excludeCompanyId,
      }))
      .filter((c) => c.domains.length > 0);

    if (expanded.length === 0) {
      return;
    }

    this.assertNoSelfCollision(expanded);
    this.assertNoCrossPayloadCollision(expanded);

    const allDomains = Array.from(
      new Set(expanded.flatMap((c) => c.domains)),
    );
    const excludedIds = expanded
      .map((c) => c.excludeCompanyId)
      .filter(isDefined);

    const ownersByDomain = await this.findExistingDomainOwners({
      workspaceId,
      domains: allDomains,
      excludedIds,
    });

    if (ownersByDomain.size === 0) {
      return;
    }

    for (const candidate of expanded) {
      for (const domain of candidate.domains) {
        const ownerId = ownersByDomain.get(domain);

        if (isDefined(ownerId) && ownerId !== candidate.excludeCompanyId) {
          throw new TwentyORMException(
            `Domain "${domain}" is already used by another company`,
            TwentyORMExceptionCode.DUPLICATE_ENTRY_DETECTED,
            {
              userFriendlyMessage: msg`The domain "${domain}" is already linked to another company.`,
            },
          );
        }
      }
    }
  }

  private async attachUpsertExcludeIds({
    workspaceId,
    candidates,
  }: {
    workspaceId: string;
    candidates: CandidateInput[];
  }): Promise<void> {
    const primaryDomains = candidates
      .map((c) => c.data.domainName?.primaryLinkUrl)
      .filter(
        (url): url is string => isDefined(url) && url !== '',
      )
      .map((url) => extractDomainFromLink(url));

    if (primaryDomains.length === 0) {
      return;
    }

    const owners = await this.findExistingDomainOwners({
      workspaceId,
      domains: Array.from(new Set(primaryDomains)),
      excludedIds: [],
    });

    if (owners.size === 0) {
      return;
    }

    for (const candidate of candidates) {
      const primaryUrl = candidate.data.domainName?.primaryLinkUrl;

      if (!isDefined(primaryUrl) || primaryUrl === '') {
        continue;
      }

      const key = extractDomainFromLink(primaryUrl);
      const ownerId = owners.get(key);

      if (isDefined(ownerId) && !isDefined(candidate.excludeCompanyId)) {
        candidate.excludeCompanyId = ownerId;
      }
    }
  }

  private assertNoSelfCollision(
    candidates: { domains: string[] }[],
  ): void {
    for (const candidate of candidates) {
      const seen = new Set<string>();

      for (const domain of candidate.domains) {
        if (seen.has(domain)) {
          throw new TwentyORMException(
            `Duplicate domain "${domain}" in payload`,
            TwentyORMExceptionCode.DUPLICATE_ENTRY_DETECTED,
            {
              userFriendlyMessage: msg`The domain "${domain}" is listed more than once on this company.`,
            },
          );
        }
        seen.add(domain);
      }
    }
  }

  private assertNoCrossPayloadCollision(
    candidates: { domains: string[]; excludeCompanyId?: string }[],
  ): void {
    if (candidates.length < 2) {
      return;
    }

    const seen = new Map<string, number>();

    candidates.forEach((candidate, index) => {
      for (const domain of candidate.domains) {
        const previousIndex = seen.get(domain);

        if (isDefined(previousIndex) && previousIndex !== index) {
          throw new TwentyORMException(
            `Duplicate domain "${domain}" across payloads`,
            TwentyORMExceptionCode.DUPLICATE_ENTRY_DETECTED,
            {
              userFriendlyMessage: msg`The domain "${domain}" is being assigned to more than one company in the same operation.`,
            },
          );
        }
        seen.set(domain, index);
      }
    });
  }

  private async findExistingDomainOwners({
    workspaceId,
    domains,
    excludedIds,
  }: {
    workspaceId: string;
    domains: string[];
    excludedIds: string[];
  }): Promise<Map<string, string>> {
    if (domains.length === 0) {
      return new Map();
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const companyRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            CompanyWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        // Don't .select() specific columns: domainName is a composite LINKS
        // field stored as multiple physical columns and the query builder
        // can't translate the field name. Let TypeORM hydrate the full row.
        const queryBuilder = companyRepository.createQueryBuilder('company');

        domains.forEach((domain, index) => {
          const paramName = `domain${index}`;
          const condition = `(LOWER(company."domainNamePrimaryLinkUrl") LIKE :${paramName} OR LOWER(company."domainNameSecondaryLinks"::text) LIKE :${paramName})`;
          const value = `%${domain.toLowerCase()}%`;

          if (index === 0) {
            queryBuilder.where(condition, { [paramName]: value });
          } else {
            queryBuilder.orWhere(condition, { [paramName]: value });
          }
        });

        if (excludedIds.length > 0) {
          queryBuilder.andWhere('company.id NOT IN (:...excludedIds)', {
            excludedIds,
          });
        }

        const candidateConflicts = await queryBuilder.getMany();
        const ownersByDomain = new Map<string, string>();

        for (const company of candidateConflicts) {
          const existingDomains = getAllCompanyDomains(company.domainName);

          for (const domain of existingDomains) {
            if (domains.includes(domain) && !ownersByDomain.has(domain)) {
              ownersByDomain.set(domain, company.id);
            }
          }
        }

        return ownersByDomain;
      },
      authContext,
    );
  }
}
