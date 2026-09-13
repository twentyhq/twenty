import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { In, QueryFailedError, Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { POSTGRESQL_ERROR_CODES } from 'src/engine/api/graphql/workspace-query-runner/constants/postgres-error-codes.constants';
import { type QueryFailedErrorWithCode } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { MessageTrackingConsentEntity } from 'src/engine/core-modules/emailing-domain/message-tracking-consent.entity';
import { MessageTrackingConsentDecision } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-decision.type';
import { MessageTrackingConsentSource } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-source.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type TrackingPreference } from 'src/modules/emailing/types/tracking-preference.type';
import { collectPersonEmailAddresses } from 'src/modules/emailing/utils/collect-person-email-addresses.util';
import { normalizeEmailAddress } from 'src/modules/emailing/utils/normalize-email-address.util';
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

    await this.upsertDecision({
      workspaceId,
      emailAddress: normalizedEmailAddress,
      decision,
      source,
    });

    const people = await this.findPeopleByEmailAddresses({
      workspaceId,
      emailAddresses: [normalizedEmailAddress],
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

    const emailAddresses = collectPersonEmailAddresses(person.emails);

    if (emailAddresses.length === 0) {
      return false;
    }

    if (decision === MessageTrackingConsentDecision.GRANTED) {
      await this.assertNotRefusedByRecipient({ workspaceId, emailAddresses });
    }

    for (const emailAddress of emailAddresses) {
      await this.upsertDecision({
        workspaceId,
        emailAddress,
        decision,
        source,
      });
    }

    await this.refreshPersonFields({ workspaceId, people: [person] });

    return true;
  }

  async refreshPeople({
    workspaceId,
    personIds,
  }: {
    workspaceId: string;
    personIds: string[];
  }): Promise<void> {
    const people = await this.findPeopleByIds({ workspaceId, personIds });

    await this.refreshPersonFields({ workspaceId, people });
  }

  private async assertNotRefusedByRecipient({
    workspaceId,
    emailAddresses,
  }: {
    workspaceId: string;
    emailAddresses: string[];
  }): Promise<void> {
    const recipientRefusal = await this.consentRepository.findOneBy(
      workspaceId,
      {
        emailAddress: In(emailAddresses),
        decision: MessageTrackingConsentDecision.DENIED,
        source: MessageTrackingConsentSource.PREFERENCES_PAGE,
      },
    );

    if (isDefined(recipientRefusal)) {
      throw new EmailingDomainException(
        `Recipient ${recipientRefusal.emailAddress} opted out of tracking themselves`,
        EmailingDomainExceptionCode.MESSAGE_TRACKING_CONSENT_REFUSED_BY_RECIPIENT,
      );
    }
  }

  private async upsertDecision({
    workspaceId,
    emailAddress,
    decision,
    source,
  }: RecordDecisionArgs): Promise<void> {
    const updateExisting = async (): Promise<boolean> => {
      const existingConsent = await this.consentRepository.findOneBy(
        workspaceId,
        { emailAddress },
      );

      if (!isDefined(existingConsent)) {
        return false;
      }

      await this.consentRepository.update(
        workspaceId,
        { id: existingConsent.id },
        { decision, source },
      );

      return true;
    };

    if (await updateExisting()) {
      return;
    }

    try {
      await this.consentRepository.insert(workspaceId, {
        emailAddress,
        decision,
        source,
      });
    } catch (error) {
      const isUniqueViolation =
        error instanceof QueryFailedError &&
        (error as QueryFailedErrorWithCode).code ===
          POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION;

      if (!isUniqueViolation || !(await updateExisting())) {
        throw error;
      }
    }
  }

  private async refreshPersonFields({
    workspaceId,
    people,
  }: {
    workspaceId: string;
    people: PersonWorkspaceEntity[];
  }): Promise<void> {
    const primaryEmailAddressByPersonId = new Map(
      people.map((person) => [
        person.id,
        normalizeEmailAddress(person.emails?.primaryEmail ?? ''),
      ]),
    );

    const emailAddresses = [
      ...new Set(primaryEmailAddressByPersonId.values()),
    ].filter(isNonEmptyString);

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
        const emailTrackingConsent =
          decisionByEmailAddress.get(
            primaryEmailAddressByPersonId.get(person.id) ?? '',
          ) ?? null;

        if ((person.emailTrackingConsent ?? null) === emailTrackingConsent) {
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
