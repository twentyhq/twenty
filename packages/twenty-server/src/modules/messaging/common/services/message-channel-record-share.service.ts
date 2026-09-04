import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, MoreThan, Repository } from 'typeorm';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { RecordShareService } from 'src/engine/record-share/services/record-share.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { ConnectedAccountOwnerService } from 'src/modules/connected-account/services/connected-account-owner.service';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { type MessageChannelRecordShareSource } from 'src/modules/messaging/common/types/message-channel-record-share-source.type';
import { buildMessageRecordSharesToInsert } from 'src/modules/messaging/common/utils/build-message-record-shares-to-insert.util';

const MESSAGE_CHANNEL_RECORD_SHARE_BATCH_SIZE = 500;

@Injectable()
export class MessageChannelRecordShareService {
  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly connectedAccountOwnerService: ConnectedAccountOwnerService,
    private readonly recordShareService: RecordShareService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async buildSource({
    messageChannel,
    connectedAccount,
    workspaceId,
  }: {
    messageChannel: Pick<MessageChannelEntity, 'id' | 'visibility'>;
    connectedAccount: Pick<ConnectedAccountEntity, 'userWorkspaceId'>;
    workspaceId: string;
  }): Promise<MessageChannelRecordShareSource> {
    return {
      messageChannelId: messageChannel.id,
      visibility: messageChannel.visibility,
      ownerWorkspaceMemberId:
        await this.connectedAccountOwnerService.findOwnerWorkspaceMemberId({
          userWorkspaceId: connectedAccount.userWorkspaceId,
          workspaceId,
        }),
    };
  }

  async rebuildRecordSharesForMessageChannel({
    workspaceId,
    messageChannelId,
  }: {
    workspaceId: string;
    messageChannelId: string;
  }): Promise<void> {
    const messageChannel = await this.messageChannelRepository.findOne({
      where: { id: messageChannelId, workspaceId },
      relations: { connectedAccount: true },
    });

    if (!isDefined(messageChannel)) {
      await this.recordShareService.deleteBySourceId({
        workspaceId,
        sourceId: messageChannelId,
      });

      return;
    }

    const source = await this.buildSource({
      messageChannel,
      connectedAccount: messageChannel.connectedAccount,
      workspaceId,
    });

    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            const messageChannelMessageAssociationRepository =
              transactionScope.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
                'messageChannelMessageAssociation',
                { shouldBypassPermissionChecks: true },
              );
            const messageRepository =
              transactionScope.getRepository<MessageWorkspaceEntity>(
                'message',
                { shouldBypassPermissionChecks: true },
              );
            const { objectIdByNameSingular } =
              messageRepository.internalContext;

            await this.recordShareService.deleteBySourceId({
              workspaceId,
              sourceId: messageChannelId,
              transactionScope,
            });

            let cursor: string | undefined;

            for (;;) {
              const associations =
                await messageChannelMessageAssociationRepository.find({
                  where: isDefined(cursor)
                    ? { messageChannelId, id: MoreThan(cursor) }
                    : { messageChannelId },
                  select: { id: true, messageId: true },
                  order: { id: 'ASC' },
                  take: MESSAGE_CHANNEL_RECORD_SHARE_BATCH_SIZE,
                });

              if (associations.length === 0) {
                break;
              }

              cursor = associations[associations.length - 1].id;

              const messages = await messageRepository.find({
                where: {
                  id: In(
                    associations.map((association) => association.messageId),
                  ),
                },
                select: { id: true, messageThreadId: true },
              });

              await this.recordShareService.insertMany({
                workspaceId,
                recordShares: buildMessageRecordSharesToInsert({
                  messageChannel: source,
                  messages,
                  messageObjectMetadataId: objectIdByNameSingular.message,
                  messageThreadObjectMetadataId:
                    objectIdByNameSingular.messageThread,
                }),
                transactionScope,
              });
            }
          },
        ),
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );
  }
}
