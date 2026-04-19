import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { type MessageChannelMessageASsociationMessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-aSsociation-message-folder.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

const MESSAGE_EXTERNAL_ID_FIELD_NAME = 'messageExternalId';

export const SEARCH_FIELDS_FOR_MESSAGE_CHANNEL_MESSAGE_ASsoCIATION: FieldTypeAndNameMetadata[] =
  [{ name: MESSAGE_EXTERNAL_ID_FIELD_NAME, type: FieldMetadataType.TEXT }];

export class MessageChannelMessageASsociationWorkspaceEntity extends BaseWorkspaceEntity {
  messageExternalId: string | null;
  messageThreadExternalId: string | null;
  direction: MessageDirection;
  messageChannelId: string;
  message: EntityRelation<MessageWorkspaceEntity> | null;
  messageId: string;
  messageFolders: EntityRelation<
    MessageChannelMessageASsociationMessageFolderWorkspaceEntity[]
  >;
}
