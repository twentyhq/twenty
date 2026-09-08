import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { ILike, IsNull, Not } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { extractDomainFromLink } from 'src/modules/contact-creation-manager/utils/extract-domain-from-link.util';
import {
  MIN_REGISTRATION_DIGITS,
  normalizeRegistrationNumber,
  registrationDigitCore,
} from 'src/modules/enso/company-merge/company-merge.constants';

// Company rows come back from the workspace ORM with NESTED composite fields
// (domainName.primaryLinkUrl), not flat columns.
type CompanyRow = {
  id: string;
  registrationNumber?: string | null;
  domainName?: { primaryLinkUrl?: string | null } | null;
};

// Finds OTHER active companies that share the trigger company's registration
// number (normalized) or registrable domain. Returns the full duplicate set
// (trigger + matches) or null when there's nothing to reconcile.
@Injectable()
export class CompanyDuplicateFinderService {
  private readonly logger = new Logger(CompanyDuplicateFinderService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async findDuplicateSet(
    authContext: WorkspaceAuthContext,
    companyId: string,
  ): Promise<string[] | null> {
    const workspaceId = authContext.workspace?.id;

    if (!workspaceId || !isDefined(companyId)) {
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

        const me: CompanyRow | null = await companyRepository.findOne({
          where: { id: companyId },
        });

        if (!me) {
          return null;
        }

        const regNormalized = normalizeRegistrationNumber(
          me.registrationNumber,
        );
        const regDigits = registrationDigitCore(me.registrationNumber);
        const domain = me.domainName?.primaryLinkUrl
          ? extractDomainFromLink(me.domainName.primaryLinkUrl)
          : '';

        const hasReg = regDigits.length >= MIN_REGISTRATION_DIGITS;

        // No identity key to dedup on (e.g. a name-only manual company) → nothing
        // to do until a registration number / domain is set.
        if (!hasReg && !domain) {
          return null;
        }

        const matchIds = new Set<string>();

        if (hasReg) {
          // Digit-core ILIKE is a formatting-agnostic prefilter; confirm full
          // normalized equality in JS ("RO 12345678" vs "12345678" vs "RO12345678").
          const byReg: CompanyRow[] = await companyRepository.find({
            where: {
              registrationNumber: ILike(`%${regDigits}%`),
              id: Not(companyId),
              deletedAt: IsNull(),
            },
          });

          for (const candidate of byReg) {
            if (
              normalizeRegistrationNumber(candidate.registrationNumber) ===
              regNormalized
            ) {
              matchIds.add(candidate.id);
            }
          }
        }

        if (domain) {
          // ILIKE can over-match ("acme.ro" vs "notacme.rocks"); confirm the
          // registrable domain matches exactly.
          const byDomain: CompanyRow[] = await companyRepository.find({
            where: {
              domainName: { primaryLinkUrl: ILike(`%${domain}%`) },
              id: Not(companyId),
              deletedAt: IsNull(),
            },
          });

          for (const candidate of byDomain) {
            if (
              isDefined(candidate.domainName?.primaryLinkUrl) &&
              extractDomainFromLink(candidate.domainName.primaryLinkUrl) ===
                domain
            ) {
              matchIds.add(candidate.id);
            }
          }
        }

        if (matchIds.size === 0) {
          return null;
        }

        this.logger.log(
          `Company ${companyId} has ${matchIds.size} registration/domain duplicate(s).`,
        );

        return [companyId, ...matchIds];
      },
      systemAuthContext,
    );
  }
}
