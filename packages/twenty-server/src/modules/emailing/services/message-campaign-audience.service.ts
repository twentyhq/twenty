import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type CampaignAudienceResolution } from 'src/engine/core-modules/emailing-domain/types/campaign-audience-resolution.type';
import { resolveCampaignAudience } from 'src/engine/core-modules/emailing-domain/utils/resolve-campaign-audience.util';
import { HARD_SUPPRESSION_REASONS } from 'src/engine/core-modules/emailing-domain/constants/hard-suppression-reasons.constant';
import { MAX_CAMPAIGN_RECIPIENTS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type RawCampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/raw-campaign-recipient.type';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { MessageListMemberWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list-member.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class MessageCampaignAudienceService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly messageSuppressionService: MessageSuppressionService,
    private readonly userRoleService: UserRoleService,
  ) {}

  async resolveNormalizedAudience({
    workspaceId,
    listId,
    roleId,
    unsubscribeTopicId,
  }: {
    workspaceId: string;
    listId: string;
    roleId: string;
    unsubscribeTopicId?: string;
  }): Promise<CampaignAudienceResolution> {
    return this.workspaceOrmManager.executeInWorkspaceContext(() =>
      this.resolveAudience({
        workspaceId,
        listId,
        roleId,
        unsubscribeTopicId,
      }),
    );
  }

  private async resolveAudience({
    workspaceId,
    listId,
    roleId,
    unsubscribeTopicId,
  }: {
    workspaceId: string;
    listId: string;
    roleId: string;
    unsubscribeTopicId?: string;
  }): Promise<CampaignAudienceResolution> {
    const { rawRecipients, totalMemberCount } =
      await this.resolveRecipientsFromList({
        listId,
        roleId,
      });

    const emailAddresses = rawRecipients
      .map((rawRecipient) => rawRecipient.email)
      .filter(isNonEmptyString);

    const suppressions =
      await this.messageSuppressionService.findApplicableSuppressions({
        workspaceId,
        emailAddresses,
        unsubscribeTopicId,
      });

    const hardSuppressedEmails = new Set<string>();
    const globallySuppressedEmails = new Set<string>();
    const topicSuppressedEmails = new Set<string>();

    for (const suppression of suppressions) {
      if (isDefined(suppression.unsubscribeTopicId)) {
        topicSuppressedEmails.add(suppression.emailAddress);
        continue;
      }

      if (HARD_SUPPRESSION_REASONS.includes(suppression.reason)) {
        hardSuppressedEmails.add(suppression.emailAddress);
        continue;
      }

      globallySuppressedEmails.add(suppression.emailAddress);
    }

    return resolveCampaignAudience({
      rawRecipients,
      totalMemberCount,
      maxRecipients: MAX_CAMPAIGN_RECIPIENTS,
      hardSuppressedEmails,
      globallySuppressedEmails,
      topicSuppressedEmails,
    });
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
  }): Promise<CampaignAudienceResolution['audience']> {
    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    const { audience } =
      await this.workspaceOrmManager.executeInWorkspaceContext(() =>
        this.resolveAudience({
          workspaceId,
          listId,
          roleId,
          unsubscribeTopicId,
        }),
      );

    return audience;
  }

  private async resolveRecipientsFromList({
    listId,
    roleId,
  }: {
    listId: string;
    roleId: string;
  }): Promise<{
    rawRecipients: RawCampaignRecipient[];
    totalMemberCount: number;
  }> {
    const listMemberRepository = this.workspaceOrmManager.getRepository(
      MessageListMemberWorkspaceEntity,
      { unionOf: [roleId] },
    );

    const members = await listMemberRepository.find({ where: { listId } });
    const personIds = members.map((member) => member.personId);

    if (personIds.length === 0) {
      return { rawRecipients: [], totalMemberCount: members.length };
    }

    const personRepository = this.workspaceOrmManager.getRepository(
      PersonWorkspaceEntity,
      { unionOf: [roleId] },
    );

    const people = await personRepository.find({
      where: { id: In(personIds) },
    });

    return {
      rawRecipients: people.map((person) => ({
        personId: person.id,
        email: person.emails?.primaryEmail ?? null,
      })),
      totalMemberCount: members.length,
    };
  }
}
