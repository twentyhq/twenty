import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type CampaignAudienceResolution } from 'src/engine/core-modules/emailing-domain/types/campaign-audience-resolution.type';
import { resolveCampaignAudience } from 'src/engine/core-modules/emailing-domain/utils/resolve-campaign-audience.util';
import { MAX_CAMPAIGN_RECIPIENTS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type RawCampaignRecipient } from 'src/engine/core-modules/emailing-domain/types/raw-campaign-recipient.type';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { MessageSuppressionService } from 'src/modules/emailing/services/message-suppression.service';
import { MessageListMemberWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-list-member.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

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
    unsubscribeTopicId,
  }: {
    workspaceId: string;
    listId: string;
    roleId: string;
    unsubscribeTopicId?: string;
  }): Promise<CampaignAudienceResolution> {
    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(() =>
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
    const rawRecipients = await this.resolveRecipientsFromList({
      workspaceId,
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

    return resolveCampaignAudience({
      rawRecipients,
      maxRecipients: MAX_CAMPAIGN_RECIPIENTS,
      globallySuppressedEmails: new Set(
        suppressions
          .filter((suppression) => !isDefined(suppression.unsubscribeTopicId))
          .map((suppression) => suppression.emailAddress),
      ),
      topicSuppressedEmails: new Set(
        suppressions
          .filter((suppression) => isDefined(suppression.unsubscribeTopicId))
          .map((suppression) => suppression.emailAddress),
      ),
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
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(() =>
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
