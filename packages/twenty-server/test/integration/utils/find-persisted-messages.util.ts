import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

export type PersistedMessage = Pick<
  MessageWorkspaceEntity,
  'id' | 'headerMessageId' | 'isDraft' | 'messageThreadId' | 'subject' | 'text'
> & {
  messageChannelMessageAssociations: Pick<
    MessageChannelMessageAssociationWorkspaceEntity,
    'messageChannelId' | 'messageExternalId'
  >[];
  messageParticipants: Pick<
    MessageParticipantWorkspaceEntity,
    'handle' | 'role'
  >[];
};

export const findPersistedMessages = async ({
  workspaceId,
  subject,
}: {
  workspaceId: string;
  subject: string;
}): Promise<PersistedMessage[]> => {
  const globalWorkspaceOrmManager = global.app.get(GlobalWorkspaceOrmManager);

  return globalWorkspaceOrmManager.executeInWorkspaceContext(
    async () => {
      const messageRepository =
        await globalWorkspaceOrmManager.getRepository<MessageWorkspaceEntity>(
          workspaceId,
          'message',
        );

      return messageRepository.find({
        where: { subject },
        relations: ['messageChannelMessageAssociations', 'messageParticipants'],
      });
    },
    buildSystemAuthContext(workspaceId),
    { lite: true },
  );
};
