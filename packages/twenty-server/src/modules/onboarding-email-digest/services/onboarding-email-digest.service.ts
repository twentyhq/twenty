import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { In, Repository } from 'typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { ONBOARDING_EMAIL_DIGEST_HANDLE_MAX_LENGTH } from 'src/modules/onboarding-email-digest/constants/onboarding-email-digest-handle-max-length.constant';
import { ONBOARDING_EMAIL_DIGEST_MAX_MESSAGES } from 'src/modules/onboarding-email-digest/constants/onboarding-email-digest-max-messages.constant';
import { ONBOARDING_EMAIL_DIGEST_MAX_PARTICIPANT_GROUPS } from 'src/modules/onboarding-email-digest/constants/onboarding-email-digest-max-participant-groups.constant';
import { type OnboardingEmailDigest } from 'src/modules/onboarding-email-digest/types/onboarding-email-digest.type';
import { type OnboardingEmailDigestParticipantGroupRow } from 'src/modules/onboarding-email-digest/types/onboarding-email-digest-participant-group-row.type';
import { type OnboardingEmailDigestRecentSubject } from 'src/modules/onboarding-email-digest/types/onboarding-email-digest-recent-subject.type';
import { type OnboardingEmailDigestTopCompanyDomain } from 'src/modules/onboarding-email-digest/types/onboarding-email-digest-top-company-domain.type';
import { type OnboardingEmailDigestTopContact } from 'src/modules/onboarding-email-digest/types/onboarding-email-digest-top-contact.type';
import { buildOnboardingEmailDigestRecentSubjects } from 'src/modules/onboarding-email-digest/utils/build-onboarding-email-digest-recent-subjects.util';
import { buildOnboardingEmailDigestTopCompanyDomains } from 'src/modules/onboarding-email-digest/utils/build-onboarding-email-digest-top-company-domains.util';
import { buildOnboardingEmailDigestTopContacts } from 'src/modules/onboarding-email-digest/utils/build-onboarding-email-digest-top-contacts.util';
import { resolveOnboardingEmailDigestSyncState } from 'src/modules/onboarding-email-digest/utils/resolve-onboarding-email-digest-sync-state.util';
import { sanitizePromptContextLine } from 'src/utils/sanitize-prompt-context-line.util';

type ImportedMessageData = {
  importedMessageCount: number;
  topContacts: OnboardingEmailDigestTopContact[];
  topCompanyDomains: OnboardingEmailDigestTopCompanyDomain[];
  recentSubjects: OnboardingEmailDigestRecentSubject[];
};

@Injectable()
export class OnboardingEmailDigestService {
  private readonly logger = new Logger(OnboardingEmailDigestService.name);

  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async buildDigestForUser({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<OnboardingEmailDigest | null> {
    try {
      return await this.buildDigest({ workspaceId, userWorkspaceId });
    } catch (error) {
      this.logger.warn(
        `Failed to build the onboarding email digest for workspace ${workspaceId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );

      return null;
    }
  }

  private async buildDigest({
    workspaceId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<OnboardingEmailDigest> {
    const connectedAccounts = await this.connectedAccountRepository.find({
      where: { workspaceId, userWorkspaceId },
    });

    if (connectedAccounts.length === 0) {
      return { syncState: 'NOT_CONNECTED' };
    }

    const messageChannels = await this.messageChannelRepository.find({
      where: {
        workspaceId,
        connectedAccountId: In(
          connectedAccounts.map((connectedAccount) => connectedAccount.id),
        ),
      },
    });

    if (messageChannels.length === 0) {
      return { syncState: 'NOT_CONNECTED' };
    }

    const ownHandles = new Set(
      connectedAccounts
        .flatMap((connectedAccount) => [
          connectedAccount.handle,
          ...(connectedAccount.handleAliases ?? []),
        ])
        .filter(isNonEmptyString)
        .map((handle) => handle.toLowerCase()),
    );

    const importedMessageData = await this.readImportedMessageData({
      workspaceId,
      messageChannelIds: messageChannels.map(
        (messageChannel) => messageChannel.id,
      ),
      ownHandles,
    });

    return {
      syncState: resolveOnboardingEmailDigestSyncState(
        messageChannels.map((messageChannel) => messageChannel.syncStatus),
      ),
      connectedAccountHandle:
        sanitizePromptContextLine(
          connectedAccounts[0].handle,
          ONBOARDING_EMAIL_DIGEST_HANDLE_MAX_LENGTH,
        ) ?? '',
      ...importedMessageData,
    };
  }

  private async readImportedMessageData({
    workspaceId,
    messageChannelIds,
    ownHandles,
  }: {
    workspaceId: string;
    messageChannelIds: string[];
    ownHandles: Set<string>;
  }): Promise<ImportedMessageData> {
    return await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageChannelMessageAssociationRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            MessageChannelMessageAssociationWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const messageChannelMessageAssociations =
          await messageChannelMessageAssociationRepository.find({
            select: ['messageId'],
            where: { messageChannelId: In(messageChannelIds) },
            order: { createdAt: 'DESC' },
            take: ONBOARDING_EMAIL_DIGEST_MAX_MESSAGES,
          });

        const messageIds = [
          ...new Set(
            messageChannelMessageAssociations.map(
              (association) => association.messageId,
            ),
          ),
        ];

        if (messageIds.length === 0) {
          return {
            importedMessageCount: 0,
            topContacts: [],
            topCompanyDomains: [],
            recentSubjects: [],
          };
        }

        const messageRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            MessageWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const messages = await messageRepository.find({
          select: ['id', 'subject', 'receivedAt'],
          where: { id: In(messageIds), isDraft: false },
          order: { receivedAt: 'DESC' },
        });

        const nonDraftMessageIds = messages.map((message) => message.id);

        if (nonDraftMessageIds.length === 0) {
          return {
            importedMessageCount: 0,
            topContacts: [],
            topCompanyDomains: [],
            recentSubjects: [],
          };
        }

        const messageParticipantRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            MessageParticipantWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const participantGroupRows = await messageParticipantRepository
          .createQueryBuilder('participant')
          .select('LOWER(participant.handle)', 'handle')
          .addSelect('MAX(participant.displayName)', 'displayName')
          .addSelect('COUNT(*)', 'messageCount')
          .where('participant.messageId IN (:...messageIds)', {
            messageIds: nonDraftMessageIds,
          })
          .andWhere('participant.workspaceMemberId IS NULL')
          .andWhere('participant.handle IS NOT NULL')
          .groupBy('LOWER(participant.handle)')
          .orderBy('COUNT(*)', 'DESC')
          .limit(ONBOARDING_EMAIL_DIGEST_MAX_PARTICIPANT_GROUPS)
          .getRawMany<OnboardingEmailDigestParticipantGroupRow>();

        return {
          importedMessageCount: messages.length,
          topContacts: buildOnboardingEmailDigestTopContacts({
            participantGroupRows,
            ownHandles,
          }),
          topCompanyDomains: buildOnboardingEmailDigestTopCompanyDomains({
            participantGroupRows,
            ownHandles,
          }),
          recentSubjects: buildOnboardingEmailDigestRecentSubjects(messages),
        };
      },
      buildSystemAuthContext(workspaceId),
    );
  }
}
