import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { In } from 'typeorm';

import { MAX_CAMPAIGN_RECIPIENTS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type CampaignSkippedBreakdown } from 'src/engine/core-modules/emailing-domain/types/campaign-skipped-breakdown.type';
import { type CampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/campaign-recipient.type';
import { type RawCampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/raw-campaign-recipient.type';
import { normalizeCampaignRecipients } from 'src/engine/core-modules/emailing-domain/utils/normalize-campaign-recipients.util';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { MessageListMemberWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list-member.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

type CampaignAudiencePreview = {
  totalMembers: number;
  withoutEmail: number;
  duplicateEmails: number;
  globallyUnsubscribed: number;
  topicUnsubscribed: number;
  sendable: number;
};

type NormalizedAudience = {
  recipients: CampaignRecipient[];
  skipped: CampaignSkippedBreakdown;
};

const toRawRecipient = (person: {
  id: string;
  emails?: { primaryEmail?: string | null } | null;
}): RawCampaignRecipient => ({
  personId: person.id,
  email: person.emails?.primaryEmail ?? null,
});

@Injectable()
export class MessageCampaignAudienceService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageSuppressionService: MessageSuppressionService,
    private readonly userRoleService: UserRoleService,
  ) {}

  async resolveNormalizedAudience({
    workspaceId,
    listId,
    roleId,
  }: {
    workspaceId: string;
    listId: string;
    roleId: string;
  }): Promise<NormalizedAudience> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const rawRecipients = await this.resolveRecipientsFromList({
          workspaceId,
          listId,
          roleId,
        });

        return normalizeCampaignRecipients(
          rawRecipients,
          MAX_CAMPAIGN_RECIPIENTS,
        );
      },
    );
  }

  async previewAudience({
    workspaceId,
    userWorkspaceId,
    listId,
    unsubscribeTopicId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    listId: string;
    unsubscribeTopicId?: string;
  }): Promise<CampaignAudiencePreview> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const rawRecipients = await this.resolveRecipientsFromList({
          workspaceId,
          listId,
          roleId,
        });

        const { recipients, skipped } = normalizeCampaignRecipients(
          rawRecipients,
          MAX_CAMPAIGN_RECIPIENTS,
        );

        const emails = recipients.map((recipient) => recipient.email);

        const globallySuppressed =
          await this.messageSuppressionService.getSuppressedAddresses(
            workspaceId,
            emails,
          );
        const topicSuppressed = isNonEmptyString(unsubscribeTopicId)
          ? await this.messageSuppressionService.getTopicSuppressedAddresses(
              workspaceId,
              emails,
              unsubscribeTopicId,
            )
          : new Set<string>();

        let globallyUnsubscribed = 0;
        let topicUnsubscribed = 0;
        let sendable = 0;

        for (const recipient of recipients) {
          const normalizedEmail = recipient.email.trim().toLowerCase();

          if (globallySuppressed.has(normalizedEmail)) {
            globallyUnsubscribed += 1;
          } else if (topicSuppressed.has(normalizedEmail)) {
            topicUnsubscribed += 1;
          } else {
            sendable += 1;
          }
        }

        return {
          totalMembers: rawRecipients.length,
          withoutEmail: skipped.noEmail,
          duplicateEmails: skipped.deduped,
          globallyUnsubscribed,
          topicUnsubscribed,
          sendable,
        };
      },
    );
  }

  private async resolveRecipientsFromList({
    workspaceId,
    listId,
    roleId,
  }: {
    workspaceId: string;
    listId: string;
    roleId: string;
  }): Promise<RawCampaignRecipient[]> {
    const listMemberRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        MessageListMemberWorkspaceEntity,
        { unionOf: [roleId] },
      );

    const members = await listMemberRepository.find({ where: { listId } });
    const personIds = members.map((member) => member.personId);

    if (personIds.length === 0) {
      return [];
    }

    const personRepository = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      PersonWorkspaceEntity,
      { unionOf: [roleId] },
    );

    const people = await personRepository.find({
      where: { id: In(personIds) },
    });

    return people.map(toRawRecipient);
  }
}
