import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { In, Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { MessageTrackingConsentEntity } from 'src/engine/core-modules/emailing-domain/message-tracking-consent.entity';
import { MessageTrackingConsentDecision } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-decision.type';
import { type MessageTrackingConsentSource } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-source.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type TrackingPreference } from 'src/modules/emailing/types/tracking-preference.type';
import { collectPersonEmailAddresses } from 'src/modules/emailing/utils/collect-person-email-addresses.util';
import { normalizeEmailAddress } from 'src/modules/emailing/utils/normalize-email-address.util';
import { resolvePersonEmailTrackingConsent } from 'src/modules/emailing/utils/resolve-person-email-tracking-consent.util';
import { addPersonEmailFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-email-filters-to-query-builder';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

type RecordDecisionArgs = {
  workspaceId: string;
  emailAddress: string;
  decision: MessageTrackingConsentDecision;
  source: MessageTrackingConsentSource;
};

@Injectable()
export class MessageTrackingConsentService {
  constructor(
    @InjectWorkspaceScopedRepository(MessageTrackingConsentEntity)
    private readonly consentRepository: WorkspaceScopedRepository<MessageTrackingConsentEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async findDecision({
    workspaceId,
    emailAddress,
  }: {
    workspaceId: string;
    emailAddress: string;
  }): Promise<MessageTrackingConsentDecision | null> {
    const consent = await this.consentRepository.findOneBy(workspaceId, {
      emailAddress: normalizeEmailAddress(emailAddress),
    });

    return consent?.decision ?? null;
  }

  async findTrackingPreference({
    workspaceId,
    emailAddress,
  }: {
    workspaceId: string;
    emailAddress: string;
  }): Promise<TrackingPreference | undefined> {
    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (
      !workspace?.isCampaignClickTrackingEnabled &&
      !workspace?.isCampaignOpenTrackingEnabled
    ) {
      return undefined;
    }

    return { decision: await this.findDecision({ workspaceId, emailAddress }) };
  }

  async findTrackingRefusedEmailAddresses({
    workspaceId,
    emailAddresses,
  }: {
    workspaceId: string;
    emailAddresses: string[];
  }): Promise<Set<string>> {
    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (
      !workspace?.isCampaignClickTrackingEnabled &&
      !workspace?.isCampaignOpenTrackingEnabled
    ) {
      return new Set();
    }

    return this.findDeniedEmailAddresses({ workspaceId, emailAddresses });
  }

  async findDeniedEmailAddresses({
    workspaceId,
    emailAddresses,
  }: {
    workspaceId: string;
    emailAddresses: string[];
  }): Promise<Set<string>> {
    const normalizedEmailAddresses = [
      ...new Set(emailAddresses.map(normalizeEmailAddress)),
    ].filter(isNonEmptyString);

    if (normalizedEmailAddresses.length === 0) {
      return new Set();
    }

    const deniedConsents = await this.consentRepository.find(workspaceId, {
      where: {
        emailAddress: In(normalizedEmailAddresses),
        decision: MessageTrackingConsentDecision.DENIED,
      },
      select: { emailAddress: true },
    });

    return new Set(deniedConsents.map((consent) => consent.emailAddress));
  }

  async recordDecision({
    workspaceId,
    emailAddress,
    decision,
    source,
  }: RecordDecisionArgs): Promise<void> {
    const normalizedEmailAddress = normalizeEmailAddress(emailAddress);

    if (!isNonEmptyString(normalizedEmailAddress)) {
      return;
    }

    const people = await this.findPeopleByEmailAddresses({
      workspaceId,
      emailAddresses: [normalizedEmailAddress],
    });

    await this.upsertDecision({
      workspaceId,
      emailAddress: normalizedEmailAddress,
      decision,
      source,
      personId: people[0]?.id ?? null,
    });

    await this.refreshPersonFields({ workspaceId, people });
  }

  async recordDecisionForPerson({
    workspaceId,
    personId,
    decision,
    source,
  }: {
    workspaceId: string;
    personId: string;
    decision: MessageTrackingConsentDecision;
    source: MessageTrackingConsentSource;
  }): Promise<boolean> {
    const [person] = await this.findPeopleByIds({
      workspaceId,
      personIds: [personId],
    });

    if (!isDefined(person)) {
      return false;
    }

    for (const emailAddress of collectPersonEmailAddresses(person.emails)) {
      await this.upsertDecision({
        workspaceId,
        emailAddress,
        decision,
        source,
        personId: person.id,
      });
    }

    await this.refreshPersonFields({ workspaceId, people: [person] });

    return true;
  }

  async linkPeople({
    workspaceId,
    personIds,
  }: {
    workspaceId: string;
    personIds: string[];
  }): Promise<void> {
    const people = await this.findPeopleByIds({ workspaceId, personIds });

    if (people.length === 0) {
      return;
    }

    await this.unlinkPeople({ workspaceId, personIds });

    for (const person of people) {
      const emailAddresses = collectPersonEmailAddresses(person.emails);

      if (emailAddresses.length === 0) {
        continue;
      }

      await this.consentRepository.update(
        workspaceId,
        { emailAddress: In(emailAddresses) },
        { personId: person.id },
      );
    }

    await this.refreshPersonFields({ workspaceId, people });
  }

  async unlinkPeople({
    workspaceId,
    personIds,
  }: {
    workspaceId: string;
    personIds: string[];
  }): Promise<void> {
    if (personIds.length === 0) {
      return;
    }

    await this.consentRepository.update(
      workspaceId,
      { personId: In(personIds) },
      { personId: null },
    );
  }

  private async upsertDecision({
    workspaceId,
    emailAddress,
    decision,
    source,
    personId,
  }: RecordDecisionArgs & { personId: string | null }): Promise<void> {
    const existingConsent = await this.consentRepository.findOneBy(
      workspaceId,
      { emailAddress },
    );

    if (isDefined(existingConsent)) {
      await this.consentRepository.update(
        workspaceId,
        { id: existingConsent.id },
        { decision, source, personId },
      );

      return;
    }

    await this.consentRepository.insert(workspaceId, {
      emailAddress,
      decision,
      source,
      personId,
    });
  }

  private async refreshPersonFields({
    workspaceId,
    people,
  }: {
    workspaceId: string;
    people: PersonWorkspaceEntity[];
  }): Promise<void> {
    const emailAddresses = [
      ...new Set(
        people.flatMap((person) => collectPersonEmailAddresses(person.emails)),
      ),
    ];

    const consents =
      emailAddresses.length > 0
        ? await this.consentRepository.find(workspaceId, {
            where: { emailAddress: In(emailAddresses) },
          })
        : [];

    const decisionByEmailAddress = new Map(
      consents.map((consent) => [consent.emailAddress, consent.decision]),
    );

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const personRepository = this.workspaceOrmManager.getRepository(
        PersonWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      for (const person of people) {
        const emailTrackingConsent = resolvePersonEmailTrackingConsent({
          emailAddresses: collectPersonEmailAddresses(person.emails),
          decisionByEmailAddress,
        });

        if (person.emailTrackingConsent === emailTrackingConsent) {
          continue;
        }

        await personRepository.update(
          { id: person.id },
          { emailTrackingConsent },
        );
      }
    }, buildSystemAuthContext(workspaceId));
  }

  private async findPeopleByIds({
    workspaceId,
    personIds,
  }: {
    workspaceId: string;
    personIds: string[];
  }): Promise<PersonWorkspaceEntity[]> {
    if (personIds.length === 0) {
      return [];
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const personRepository = this.workspaceOrmManager.getRepository(
        PersonWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      return personRepository.find({ where: { id: In(personIds) } });
    }, buildSystemAuthContext(workspaceId));
  }

  private async findPeopleByEmailAddresses({
    workspaceId,
    emailAddresses,
  }: {
    workspaceId: string;
    emailAddresses: string[];
  }): Promise<PersonWorkspaceEntity[]> {
    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const personRepository = this.workspaceOrmManager.getRepository(
        PersonWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

      const people = await addPersonEmailFiltersToQueryBuilder({
        queryBuilder: personRepository.createQueryBuilder('person'),
        emails: emailAddresses,
      }).getMany<PersonWorkspaceEntity>();

      return people.filter((person) => !isDefined(person.deletedAt));
    }, buildSystemAuthContext(workspaceId));
  }
}
