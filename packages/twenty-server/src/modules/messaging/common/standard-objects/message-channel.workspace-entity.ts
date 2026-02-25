import { registerEnumType } from '@nestjs/graphql';

import { FieldMetadataType } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

export enum MessageChannelSyncStatus {
  NOT_SYNCED = 'NOT_SYNCED',
  ONGOING = 'ONGOING',
  ACTIVE = 'ACTIVE',
  FAILED_INSUFFICIENT_PERMISSIONS = 'FAILED_INSUFFICIENT_PERMISSIONS',
  FAILED_UNKNOWN = 'FAILED_UNKNOWN',
}

export enum MessageChannelSyncStage {
  PENDING_CONFIGURATION = 'PENDING_CONFIGURATION',
  MESSAGE_LIST_FETCH_PENDING = 'MESSAGE_LIST_FETCH_PENDING',
  MESSAGE_LIST_FETCH_SCHEDULED = 'MESSAGE_LIST_FETCH_SCHEDULED',
  MESSAGE_LIST_FETCH_ONGOING = 'MESSAGE_LIST_FETCH_ONGOING',
  MESSAGES_IMPORT_PENDING = 'MESSAGES_IMPORT_PENDING',
  MESSAGES_IMPORT_SCHEDULED = 'MESSAGES_IMPORT_SCHEDULED',
  MESSAGES_IMPORT_ONGOING = 'MESSAGES_IMPORT_ONGOING',
  FAILED = 'FAILED',
}

export enum MessageChannelVisibility {
  METADATA = 'METADATA',
  SUBJECT = 'SUBJECT',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
}

export enum MessageChannelType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum MessageChannelContactAutoCreationPolicy {
  SENT_AND_RECEIVED = 'SENT_AND_RECEIVED',
  SENT = 'SENT',
  NONE = 'NONE',
}

export enum MessageFolderImportPolicy {
  ALL_FOLDERS = 'ALL_FOLDERS',
  SELECTED_FOLDERS = 'SELECTED_FOLDERS',
}

export enum MessageChannelPendingGroupEmailsAction {
  GROUP_EMAILS_DELETION = 'GROUP_EMAILS_DELETION',
  GROUP_EMAILS_IMPORT = 'GROUP_EMAILS_IMPORT',
  NONE = 'NONE',
}

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
