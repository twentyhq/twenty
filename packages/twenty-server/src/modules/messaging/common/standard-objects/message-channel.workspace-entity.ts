import { registerEnumType } from '@nestjs/graphql';

import {
  FieldMetadataType,
  MessageChannelContactAutoCreationPolicy,
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelVisibility,
  MessageFolderImportPolicy,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

export {
  MessageChannelContactAutoCreationPolicy,
  MessageChannelPendingGroupEmailsAction,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
  MessageChannelVisibility,
  MessageFolderImportPolicy,
};

registerEnumType(MessageChannelVisibility, {
  name: 'MessageChannelVisibility',
});

registerEnumType(MessageChannelSyncStatus, {
  name: 'MessageChannelSyncStatus',
});

registerEnumType(MessageChannelSyncStage, {
  name: 'MessageChannelSyncStage',
});

registerEnumType(MessageChannelType, {
  name: 'MessageChannelType',
});

registerEnumType(MessageChannelContactAutoCreationPolicy, {
  name: 'MessageChannelContactAutoCreationPolicy',
});

registerEnumType(MessageFolderImportPolicy, {
  name: 'MessageFolderImportPolicy',
});

registerEnumType(MessageChannelPendingGroupEmailsAction, {
  name: 'MessageChannelPendingGroupEmailsAction',
});

const HANDLE_FIELD_NAME = 'handle';

export const SEARCH_FIELDS_FOR_MESSAGE_CHANNEL: FieldTypeAndNameMetadata[] = [
  { name: HANDLE_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class MessageChannelWorkspaceEntity extends BaseWorkspaceEntity {
  visibility: string;
  handle: string | null;
  type: string;
  isContactAutoCreationEnabled: boolean;
  contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy;
  messageFolderImportPolicy: MessageFolderImportPolicy;
  excludeNonProfessionalEmails: boolean;
  excludeGroupEmails: boolean;
  pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction;
  isSyncEnabled: boolean;
  syncCursor: string | null;
  syncedAt: string | null;
  syncStatus: MessageChannelSyncStatus | null;
  syncStage: MessageChannelSyncStage;
  syncStageStartedAt: string | null;
  throttleFailureCount: number;
  throttleRetryAfter: string | null;
  connectedAccount: EntityRelation<ConnectedAccountWorkspaceEntity>;
  connectedAccountId: string;
  messageChannelMessageAssociations: EntityRelation<
    MessageChannelMessageAssociationWorkspaceEntity[]
  >;
  messageFolders: EntityRelation<MessageFolderWorkspaceEntity[]>;
}
