import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import groupBy from 'lodash.groupby';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { MessageChannelVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class ApplyMessagesVisibilityRestrictionsService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
  ) {}

  public async applyMessagesVisibilityRestrictions(
    messages: MessageWorkspaceEntity[],
    workspaceId: string,
    userId?: string,
  ) {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageChannelMessageAssociationRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
            workspaceId,
            'messageChannelMessageAssociation',
          );

        const messageChannelMessagesAssociations =
          await messageChannelMessageAssociationRepository.find({
            where: {
              messageId: In(messages.map((message) => message.id)),
            },
          });

        const messageChannelIds = [
          ...new Set(
            messageChannelMessagesAssociations.map((a) => a.messageChannelId),
          ),
        ];

        const messageChannelsFromCore =
          messageChannelIds.length > 0
            ? await this.messageChannelRepository.find({
                where: {
                  id: In(messageChannelIds),
                  workspaceId,
                },
              })
            : [];

        const messageChannelMap = new Map(
          messageChannelsFromCore.map((ch) => [ch.id, ch]),
        );

        const workspaceMemberRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
          );

        for (let i = messages.length - 1; i >= 0; i--) {
          const associations = messageChannelMessagesAssociations.filter(
            (association) => association.messageId === messages[i].id,
          );

          const messageChannels = associations
            .map((association) =>
              messageChannelMap.get(association.messageChannelId),
            )
            .filter(isDefined);

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
            const workspaceMember =
              await workspaceMemberRepository.findOneByOrFail({
                userId,
              });

            const userWorkspace = await this.userWorkspaceRepository.findOne({
              where: { userId: workspaceMember.userId, workspaceId },
            });

            if (userWorkspace) {
              const connectedAccounts =
                await this.connectedAccountRepository.find({
                  where: {
                    userWorkspaceId: userWorkspace.id,
                    workspaceId,
                    messageChannels: {
                      id: In(messageChannels.map((channel) => channel.id)),
                    },
                  },
                  relations: { messageChannels: true },
                });

              if (connectedAccounts.length > 0) {
                continue;
              }
            }
          }

          if (
            messageChannelsGroupByVisibility[MessageChannelVisibility.SUBJECT]
          ) {
            messages[i].text = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
            continue;
          }

          if (
            messageChannelsGroupByVisibility[MessageChannelVisibility.METADATA]
          ) {
            messages[i].subject =
              FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
            messages[i].text = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;
            continue;
          }

          messages.splice(i, 1);
        }

        return messages;
      },
      authContext,
    );
  }
}
