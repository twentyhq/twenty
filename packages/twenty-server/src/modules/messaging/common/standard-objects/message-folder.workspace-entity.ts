import { registerEnumType } from '@nestjs/graphql';

import { MessageFolderPendingSyncAction } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageChannelMessageAssociationMessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association-message-folder.workspace-entity';

export { MessageFolderPendingSyncAction };

registerEnumType(MessageFolderPendingSyncAction, {
  name: 'MessageFolderPendingSyncAction',
});

export class MessageFolderWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  syncCursor: string | null;
  isSentFolder: boolean;
  isSynced: boolean;
  parentFolderId: string | null;
  externalId: string | null;
  pendingSyncAction: MessageFolderPendingSyncAction;
  messageChannelId: string;
  messageChannelMessageAssociationMessageFolders: EntityRelation<
    MessageChannelMessageAssociationMessageFolderWorkspaceEntity[]
  >;
}
