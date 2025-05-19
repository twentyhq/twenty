import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelVisibility } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class ApplyMessagesVisibilityRestrictionsService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  public async applyMessagesVisibilityRestrictions(
    messages: MessageWorkspaceEntity[],
    userId?: string, // undefined when request is made with api key
  ) {
    const messageChannelMessageAssociationRepository =
      await this.twentyORMManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
        'messageChannelMessageAssociation',
      );

    const messageChannelMessagesAssociations =
      await messageChannelMessageAssociationRepository.find({
        where: {
          messageId: In(messages.map((message) => message.id)),
        },
        relations: ['messageChannel'],
      });

    const connectedAccountRepository =
      await this.twentyORMManager.getRepository<ConnectedAccountWorkspaceEntity>(
        'connectedAccount',
      );

    const workspaceMemberRepository =
      await this.twentyORMManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        'workspaceMember',
      );

    for (let i = messages.length - 1; i >= 0; i--) {
      const messageChannelMessageAssociations =
        messageChannelMessagesAssociations.filter(
          (association) => association.messageId === messages[i].id,
        );

      const messageChannels = messageChannelMessageAssociations
        .map((association) => association.messageChannel)
        .filter(
          (channel): channel is NonNullable<typeof channel> => channel !== null,
        );

      if (messageChannels.length === 0) {
        throw new NotFoundError('Associated message channels not found');
      }

      const messageChannelsGroupByVisibility = groupBy(
        messageChannels,
        (channel) => channel.visibility,
      );

      if (
        messageChannelsGroupByVisibility[
          MessageChannelVisibility.SHARE_EVERYTHING
        ]
      ) {
        continue;
      }

      if (isDefined(userId)) {
        const workspaceMember = await workspaceMemberRepository.findOneByOrFail(
          {
            userId,
          },
        );

        const connectedAccounts = await connectedAccountRepository.find({
          select: ['id'],
          where: {
            messageChannels: {
              id: In(messageChannels.map((channel) => channel.id)),
            },
            accountOwnerId: workspaceMember.id,
          },
        });

        if (connectedAccounts.length > 0) {
          continue;
        }
      }

      if (messageChannelsGroupByVisibility[MessageChannelVisibility.SUBJECT]) {
        messages[i].text = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
        continue;
      }

      if (messageChannelsGroupByVisibility[MessageChannelVisibility.METADATA]) {
        messages[i].subject = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
        messages[i].text = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
        continue;
      }

      messages.splice(i, 1);
    }

    return messages;
  }
}
