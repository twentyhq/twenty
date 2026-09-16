import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { In, Not, QueryFailedError, Repository } from 'typeorm';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type EmailsMetadata } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

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
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type TrackingPreference } from 'src/modules/emailing/types/tracking-preference.type';
import { addPersonEmailFiltersToQueryBuilder } from 'src/modules/match-participant/utils/add-person-email-filters-to-query-builder';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class MessageTrackingConsentService {
  constructor(
    @InjectWorkspaceScopedRepository(MessageTrackingConsentEntity)
    private readonly consentRepository: WorkspaceScopedRepository<MessageTrackingConsentEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly permissionsService: PermissionsService,
    private readonly userRoleService: UserRoleService,
  ) {}

  async findDecision({
    workspaceId,
    emailAddress,
  }: {
    workspaceId: string;
    emailAddress: string;
  }): Promise<MessageTrackingConsentDecision | null> {
    const consent = await this.consentRepository.findOneBy(workspaceId, {
      emailAddress: this.normalizeEmailAddress(emailAddress),
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
    if (!(await this.isClickTrackingEnabled(workspaceId))) {
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
    if (!(await this.isClickTrackingEnabled(workspaceId))) {
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
      ...new Set(
        emailAddresses.map((emailAddress) =>
          this.normalizeEmailAddress(emailAddress),
        ),
      ),
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
  }: {
    workspaceId: string;
    emailAddress: string;
    decision: MessageTrackingConsentDecision;
    source: MessageTrackingConsentSource;
  }): Promise<void> {
    const normalizedEmailAddress = this.normalizeEmailAddress(emailAddress);

    if (!isNonEmptyString(normalizedEmailAddress)) {
      return;
    }

    await this.upsertDecisionsAndRefresh({
      workspaceId,
      emailAddresses: [normalizedEmailAddress],
      decision,
      source,
    });
  }

  async recordDecisionForPerson({
    workspaceId,
    userWorkspaceId,
    personId,
    decision,
    source,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    personId: string;
    decision: MessageTrackingConsentDecision;
    source: MessageTrackingConsentSource;
  }): Promise<boolean> {
    await this.assertCanUpdatePeople({ workspaceId, userWorkspaceId });

    const person = await this.findPersonReadableByMember({
      workspaceId,
      userWorkspaceId,
      personId,
    });

    if (!isDefined(person)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    const emailAddresses = this.collectPersonEmailAddresses(person.emails);

    if (emailAddresses.length === 0) {
      return false;
    }

    if (decision === MessageTrackingConsentDecision.GRANTED) {
      await this.assertNotRefusedByRecipient({ workspaceId, emailAddresses });
    }

    await this.upsertDecisionsAndRefresh({
      workspaceId,
      emailAddresses,
      decision,
      source,
    });

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

  private async isClickTrackingEnabled(workspaceId: string): Promise<boolean> {
    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    return workspace?.isCampaignClickTrackingEnabled ?? false;
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

  private async upsertDecisionsAndRefresh({
    workspaceId,
    emailAddresses,
    decision,
    source,
  }: {
    workspaceId: string;
    emailAddresses: string[];
    decision: MessageTrackingConsentDecision;
    source: MessageTrackingConsentSource;
  }): Promise<void> {
    await this.upsertDecisions({
      workspaceId,
      emailAddresses,
      decision,
      source,
    });
    await this.refreshPeopleByEmailAddresses({ workspaceId, emailAddresses });
  }

  private async upsertDecisions({
    workspaceId,
    emailAddresses,
    decision,
    source,
  }: {
    workspaceId: string;
    emailAddresses: string[];
    decision: MessageTrackingConsentDecision;
    source: MessageTrackingConsentSource;
  }): Promise<void> {
    const existingConsents = await this.consentRepository.find(workspaceId, {
      where: { emailAddress: In(emailAddresses) },
    });
    const existingConsentIds = existingConsents.map((consent) => consent.id);

    if (existingConsentIds.length > 0) {
      const updatedCount = await this.updateDecisions({
        workspaceId,
        consentIds: existingConsentIds,
        decision,
        source,
      });

      if (
        source === MessageTrackingConsentSource.WORKSPACE_MEMBER &&
        decision === MessageTrackingConsentDecision.GRANTED &&
        updatedCount < existingConsentIds.length
      ) {
        throw new EmailingDomainException(
          'A recipient opted out of tracking themselves',
          EmailingDomainExceptionCode.MESSAGE_TRACKING_CONSENT_REFUSED_BY_RECIPIENT,
        );
      }
    }

    const existingEmailAddresses = new Set(
      existingConsents.map((consent) => consent.emailAddress),
    );
    const emailAddressesToInsert = emailAddresses.filter(
      (emailAddress) => !existingEmailAddresses.has(emailAddress),
    );

    if (emailAddressesToInsert.length === 0) {
      return;
    }

    try {
      await this.consentRepository.insert(
        workspaceId,
        emailAddressesToInsert.map((emailAddress) => ({
          emailAddress,
          decision,
          source,
        })),
      );
    } catch (error) {
      const isUniqueViolation =
        error instanceof QueryFailedError &&
        (error as QueryFailedErrorWithCode).code ===
          POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION;

      if (!isUniqueViolation) {
        throw error;
      }

      await this.upsertDecisions({
        workspaceId,
        emailAddresses: emailAddressesToInsert,
        decision,
        source,
      });
    }
  }

  private async updateDecisions({
    workspaceId,
    consentIds,
    decision,
    source,
  }: {
    workspaceId: string;
    consentIds: string[];
    decision: MessageTrackingConsentDecision;
    source: MessageTrackingConsentSource;
  }): Promise<number> {
    switch (source) {
      case MessageTrackingConsentSource.PREFERENCES_PAGE: {
        const { affected } = await this.consentRepository.update(
          workspaceId,
          { id: In(consentIds) },
          { decision, source },
        );

        return affected ?? 0;
      }
      case MessageTrackingConsentSource.WORKSPACE_MEMBER: {
        const outsidePreferencesPage = await this.consentRepository.update(
          workspaceId,
          {
            id: In(consentIds),
            source: Not(MessageTrackingConsentSource.PREFERENCES_PAGE),
          },
          { decision, source },
        );
        const grantedOnPreferencesPage = await this.consentRepository.update(
          workspaceId,
          {
            id: In(consentIds),
            source: MessageTrackingConsentSource.PREFERENCES_PAGE,
            decision: Not(MessageTrackingConsentDecision.DENIED),
          },
          { decision, source },
        );

        return (
          (outsidePreferencesPage.affected ?? 0) +
          (grantedOnPreferencesPage.affected ?? 0)
        );
      }
      default:
        return assertUnreachable(source);
    }
  }

  private async refreshPeopleByEmailAddresses({
    workspaceId,
    emailAddresses,
  }: {
    workspaceId: string;
    emailAddresses: string[];
  }): Promise<void> {
    const people = await this.findPeopleByEmailAddresses({
      workspaceId,
      emailAddresses,
    });

    await this.refreshPersonFields({ workspaceId, people });
  }

  private async isPersonConsentFieldProvisioned(
    workspaceId: string,
  ): Promise<boolean> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    return isDefined(
      flatFieldMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.person.fields.emailTrackingConsent.universalIdentifier
      ],
    );
  }

  private async refreshPersonFields({
    workspaceId,
    people,
  }: {
    workspaceId: string;
    people: PersonWorkspaceEntity[];
  }): Promise<void> {
    if (
      people.length === 0 ||
      !(await this.isPersonConsentFieldProvisioned(workspaceId))
    ) {
      return;
    }

    const primaryEmailAddressByPersonId = new Map(
      people.map((person) => [
        person.id,
        this.normalizeEmailAddress(person.emails?.primaryEmail ?? ''),
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

      const personIdsByDecision = new Map<
        MessageTrackingConsentDecision | null,
        string[]
      >();

      for (const person of people) {
        const emailTrackingConsent =
          decisionByEmailAddress.get(
            primaryEmailAddressByPersonId.get(person.id) ?? '',
          ) ?? null;

        if ((person.emailTrackingConsent ?? null) === emailTrackingConsent) {
          continue;
        }

        personIdsByDecision.set(emailTrackingConsent, [
          ...(personIdsByDecision.get(emailTrackingConsent) ?? []),
          person.id,
        ]);
      }

      for (const [emailTrackingConsent, personIds] of personIdsByDecision) {
        await personRepository.update(
          { id: In(personIds) },
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

  private normalizeEmailAddress(emailAddress: string): string {
    return emailAddress.trim().toLowerCase();
  }

  private collectPersonEmailAddresses(
    emails: EmailsMetadata | null | undefined,
  ): string[] {
    const emailAddresses = [
      emails?.primaryEmail,
      ...(emails?.additionalEmails ?? []),
    ]
      .filter(isNonEmptyString)
      .map((emailAddress) => this.normalizeEmailAddress(emailAddress));

    return [...new Set(emailAddresses)];
  }

  private async assertCanUpdatePeople({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<void> {
    const [{ objectsPermissions }, { flatObjectMetadataMaps }] =
      await Promise.all([
        this.permissionsService.getUserWorkspacePermissions({
          workspaceId,
          userWorkspaceId,
        }),
        this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatObjectMetadataMaps',
        ]),
      ]);

    const personObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.person.universalIdentifier
      ];
    const personPermissions = isDefined(personObjectMetadata)
      ? objectsPermissions[personObjectMetadata.id]
      : undefined;

    if (!personPermissions?.canUpdateObjectRecords) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }

  private async findPersonReadableByMember({
    workspaceId,
    userWorkspaceId,
    personId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    personId: string;
  }): Promise<PersonWorkspaceEntity | null> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const personRepository = this.workspaceOrmManager.getRepository(
        PersonWorkspaceEntity,
        { unionOf: [roleId] },
      );

      return personRepository.findOne({ where: { id: personId } });
    });
  }
}
