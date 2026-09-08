import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { ILike } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { extractDomainFromLink } from 'src/modules/contact-creation-manager/utils/extract-domain-from-link.util';
import { getCompanyNameFromDomainName } from 'src/modules/contact-creation-manager/utils/get-company-name-from-domain-name.util';
import { getDomainNameFromHandle } from 'src/modules/contact-creation-manager/utils/get-domain-name-from-handle.util';
import {
  COMPANY_ENRICHMENT_STATUS,
  SYSTEM_ACTOR,
} from 'src/modules/enso/company-enrichment/company-enrichment.constants';
import { buildEnsoTimelineInserts } from 'src/modules/enso/timeline/enso-timeline.util';
import { isWorkEmail } from 'src/utils/is-work-email';

// Inbound-activity object metadata id (single prod workspace). Used as the
// linkedObjectMetadataId on every enso-event row so they share the green ENSO
// icon (the icon is decorative — no record link needed).
const INBOUND_ACTIVITY_OBJECT_METADATA_ID =
  'cef40992-41c4-4742-8b4c-234777a1b8c6';

export type ResolveCompanyOutcome = {
  companyId: string;
  // true when this run created (or restored) the company — only then is a fresh
  // enrichment pass worth enqueueing.
  created: boolean;
};

// Given a freshly created/updated person, create-or-restore the Company for the
// person's WORK-email domain and link the person to it. Personal-email leads
// (Gmail/Yahoo/…) produce no company. Idempotent: dedups by registrable domain
// and un-soft-deletes a previously deleted company instead of duplicating it.
@Injectable()
export class CompanyFromPersonService {
  private readonly logger = new Logger(CompanyFromPersonService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async resolveFromPerson(
    workspaceId: string,
    personId: string,
  ): Promise<ResolveCompanyOutcome | null> {
    if (!isDefined(workspaceId) || !isDefined(personId)) {
      return null;
    }

    const systemAuthContext = buildSystemAuthContext(workspaceId);

    try {
      return await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const personRepository =
            await this.globalWorkspaceOrmManager.getRepository<any>(
              workspaceId,
              'person',
              { shouldBypassPermissionChecks: true },
            );

          const person = await personRepository.findOne({
            where: { id: personId },
          });

          // Already linked — don't reassign a person's company on later edits.
          if (!person || isDefined(person.companyId)) {
            return null;
          }

          // person-created: surface every freshly created, not-yet-linked
          // contact on its own timeline (both B2B and B2C — runs before the
          // work-email branch below). Best-effort.
          await this.recordPersonCreated(
            workspaceId,
            personId,
            this.personFullName(person),
          );

          const domain = this.extractWorkDomain(person);

          if (!domain) {
            return null;
          }

          const companyRepository =
            await this.globalWorkspaceOrmManager.getRepository<any>(
              workspaceId,
              'company',
              { shouldBypassPermissionChecks: true },
            );

          const { companyId, created } = await this.findOrCreateCompany(
            companyRepository,
            domain,
          );

          await personRepository.update(
            { id: personId },
            { companyId, updatedBy: SYSTEM_ACTOR },
          );

          const personName = this.personFullName(person);
          const company = await companyRepository.findOne({
            where: { id: companyId },
          });
          const companyName = company?.name || domain;

          // Company genesis first (only when we actually created it), then the
          // link. happensAt offset keeps "created" below "linked" on the
          // company timeline (newest-first).
          if (created) {
            await this.recordCompanyCreated(workspaceId, {
              companyId,
              companyName,
              personId,
              personName,
              domain,
              happensAt: new Date(Date.now() - 1000).toISOString(),
            });
          }

          await this.recordCompanyLinked(workspaceId, {
            personId,
            personName,
            companyId,
            companyName,
            domain,
          });

          return { companyId, created };
        },
        systemAuthContext,
      );
    } catch (error) {
      this.logger.warn(
        `Company resolution failed for person ${personId}: ${(error as Error).message}`,
      );

      return null;
    }
  }

  // Provenance on the person + company timeline (best-effort): which contact was
  // matched to which company and why ("Linked {Person} to {Company} — their work
  // email is on the company domain {domain}, … — by ENSO CRM").
  private async recordCompanyLinked(
    workspaceId: string,
    params: {
      personId: string;
      personName: string;
      companyId: string;
      companyName: string;
      domain: string;
    },
  ): Promise<void> {
    try {
      const timelineRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'timelineActivity',
          { shouldBypassPermissionChecks: true },
        );

      const rows = buildEnsoTimelineInserts({
        action: 'company-linked',
        target: { personId: params.personId, companyId: params.companyId },
        segments: [
          { text: 'Linked ' },
          {
            label: params.personName || 'this contact',
            objectNameSingular: 'person',
            recordId: params.personId,
          },
          { text: ' to ' },
          {
            label: params.companyName,
            objectNameSingular: 'company',
            recordId: params.companyId,
          },
          {
            text: ` — their work email is on the company domain ${params.domain}, so they were matched to this company.`,
          },
        ],
        auto: true,
        linkedObjectMetadataId: INBOUND_ACTIVITY_OBJECT_METADATA_ID,
      });

      if (rows.length > 0) {
        await timelineRepository.insert(rows);
      }
    } catch (error) {
      this.logger.warn(
        `company-linked timeline write failed for person ${params.personId}: ${
          (error as Error).message
        }`,
      );
    }
  }

  // Company genesis on the company's timeline (best-effort): the company was
  // auto-created from the first contact's work-email domain. Only emitted when
  // this run actually created the company.
  private async recordCompanyCreated(
    workspaceId: string,
    params: {
      companyId: string;
      companyName: string;
      personId: string;
      personName: string;
      domain: string;
      happensAt: string;
    },
  ): Promise<void> {
    try {
      const timelineRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'timelineActivity',
          { shouldBypassPermissionChecks: true },
        );

      const rows = buildEnsoTimelineInserts({
        action: 'company-created',
        target: { companyId: params.companyId },
        segments: [
          {
            label: params.companyName,
            objectNameSingular: 'company',
            recordId: params.companyId,
          },
          { text: ' was created from the work email of ' },
          {
            label: params.personName || 'a new contact',
            objectNameSingular: 'person',
            recordId: params.personId,
          },
          { text: ` on the company domain ${params.domain}.` },
        ],
        auto: true,
        linkedObjectMetadataId: INBOUND_ACTIVITY_OBJECT_METADATA_ID,
        happensAt: params.happensAt,
      });

      if (rows.length > 0) {
        await timelineRepository.insert(rows);
      }
    } catch (error) {
      this.logger.warn(
        `company-created timeline write failed for company ${params.companyId}: ${
          (error as Error).message
        }`,
      );
    }
  }

  // person-created genesis on the person's own timeline (best-effort):
  // "{Person} was created as a new contact. — by ENSO CRM".
  private async recordPersonCreated(
    workspaceId: string,
    personId: string,
    personName: string,
  ): Promise<void> {
    try {
      // Skip unnamed shells (the UI creates a person with an empty name first,
      // then sets it via an update). resolveFromPerson re-runs on that update,
      // emitting person-created with the real name. n8n single-payload creates
      // already carry the name, so they fire here directly.
      if (!personName || personName.length === 0) {
        return;
      }

      const timelineRepository =
        await this.globalWorkspaceOrmManager.getRepository<any>(
          workspaceId,
          'timelineActivity',
          { shouldBypassPermissionChecks: true },
        );

      // Idempotent: resolveFromPerson runs on both create and (pre-link) update,
      // so guard against a second person-created if one already exists.
      const existing = await timelineRepository.findOne({
        where: { name: 'enso-event.person-created', targetPersonId: personId },
      });

      if (existing) {
        return;
      }

      const rows = buildEnsoTimelineInserts({
        action: 'person-created',
        target: { personId },
        segments: [
          {
            label: personName || 'A new contact',
            objectNameSingular: 'person',
            recordId: personId,
          },
          { text: ' was created as a new contact.' },
        ],
        auto: true,
        linkedObjectMetadataId: INBOUND_ACTIVITY_OBJECT_METADATA_ID,
      });

      if (rows.length > 0) {
        await timelineRepository.insert(rows);
      }
    } catch (error) {
      this.logger.warn(
        `person-created timeline write failed for person ${personId}: ${
          (error as Error).message
        }`,
      );
    }
  }

  // "First Last" for a person, or '' when unavailable.
  private personFullName(person: {
    name?: { firstName?: string | null; lastName?: string | null } | null;
  }): string {
    return [person.name?.firstName, person.name?.lastName]
      .filter((part) => typeof part === 'string' && part.length > 0)
      .join(' ')
      .trim();
  }

  // First work email wins (primary, then additional). Returns the registrable
  // domain ("acme.ro") or null when the person has only personal-provider emails.
  private extractWorkDomain(person: {
    emails?: {
      primaryEmail?: string | null;
      additionalEmails?: string[] | null;
    };
  }): string | null {
    const candidates = [
      person.emails?.primaryEmail,
      ...(person.emails?.additionalEmails ?? []),
    ].filter((email): email is string => isDefined(email) && email.length > 0);

    for (const email of candidates) {
      if (!isWorkEmail(email)) {
        continue;
      }

      const domain = getDomainNameFromHandle(email);

      if (domain) {
        return domain;
      }
    }

    return null;
  }

  private async findOrCreateCompany(
    companyRepository: any,
    domain: string,
  ): Promise<ResolveCompanyOutcome> {
    const existingCompanies = await companyRepository.find({
      where: { domainName: { primaryLinkUrl: ILike(`%${domain}%`) } },
      withDeleted: true,
    });

    // ILIKE can over-match (e.g. "acme.ro" vs "notacme.rocks"); confirm the
    // registrable domain matches exactly.
    const existing = existingCompanies.find(
      (company: { domainName?: { primaryLinkUrl?: string } }) =>
        isDefined(company.domainName?.primaryLinkUrl) &&
        extractDomainFromLink(company.domainName.primaryLinkUrl) === domain,
    );

    if (existing) {
      if (isDefined(existing.deletedAt)) {
        await companyRepository.update(
          { id: existing.id },
          { deletedAt: null, updatedBy: SYSTEM_ACTOR },
        );

        return { companyId: existing.id, created: true };
      }

      return { companyId: existing.id, created: false };
    }

    const lastPosition =
      (await companyRepository.maximum('position', undefined)) ?? 0;

    const created = await companyRepository.save({
      name: getCompanyNameFromDomainName(domain),
      domainName: { primaryLinkUrl: `https://${domain}` },
      enrichmentStatus: COMPANY_ENRICHMENT_STATUS.PENDING,
      position: lastPosition + 1,
      createdBy: SYSTEM_ACTOR,
      updatedBy: SYSTEM_ACTOR,
    });

    return { companyId: created.id, created: true };
  }
}
