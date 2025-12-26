import { registerEnumType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIndex } from 'src/engine/twenty-orm/decorators/workspace-index.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MESSAGE_FOLDER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export enum MessageFolderPendingSyncAction {
  FOLDER_DELETION = 'FOLDER_DELETION',
  NONE = 'NONE',
}

registerEnumType(MessageFolderPendingSyncAction, {
  name: 'MessageFolderPendingSyncAction',
});

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.messageFolder,

  namePlural: 'messageFolders',
  labelSingular: msg`Message Folder`,
  labelPlural: msg`Message Folders`,
  description: msg`Folder for Message Channel`,
  icon: STANDARD_OBJECT_ICONS.messageFolder,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
@WorkspaceIndex(['messageChannelId', 'externalId'], {
  isUnique: true,
  indexWhereClause: '"deletedAt" IS NULL',
})
export class MessageFolderWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MESSAGE_FOLDER_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Folder name`,
    icon: 'IconFolder',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  name: string | null;

  @WorkspaceRelation({
    standardId: MESSAGE_FOLDER_STANDARD_FIELD_IDS.messageChannel,
    type: RelationType.MANY_TO_ONE,
    label: msg`Message Channel`,
    description: msg`Message Channel`,
    icon: 'IconMessage',
    inverseSideTarget: () => MessageChannelWorkspaceEntity,
    inverseSideFieldKey: 'messageFolders',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  messageChannel: Relation<MessageChannelWorkspaceEntity>;

  @WorkspaceField({
    standardId: MESSAGE_FOLDER_STANDARD_FIELD_IDS.syncCursor,
    type: FieldMetadataType.TEXT,
    label: msg`Sync Cursor`,
    description: msg`Sync Cursor`,
    icon: 'IconHash',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  syncCursor: string | null;

  @WorkspaceField({
    standardId: MESSAGE_FOLDER_STANDARD_FIELD_IDS.isSentFolder,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Sent Folder`,
    description: msg`Is Sent Folder`,
    icon: 'IconCheck',
    defaultValue: false,
  })
  @WorkspaceIsFieldUIReadOnly()
  isSentFolder: boolean;

  @WorkspaceField({
    standardId: MESSAGE_FOLDER_STANDARD_FIELD_IDS.isSynced,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Synced`,
    description: msg`Is Synced`,
    icon: 'IconCheck',
    defaultValue: false,
  })
  @WorkspaceIsFieldUIReadOnly()
  isSynced: boolean;

  @WorkspaceField({
    standardId: MESSAGE_FOLDER_STANDARD_FIELD_IDS.parentFolderId,
    type: FieldMetadataType.TEXT,
    label: msg`Parent Folder ID`,
    description: msg`Parent Folder ID`,
    icon: 'IconFolder',
    defaultValue: null,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  parentFolderId: string | null;

  @WorkspaceField({
    standardId: MESSAGE_FOLDER_STANDARD_FIELD_IDS.externalId,
    type: FieldMetadataType.TEXT,
    label: msg`External ID`,
    description: msg`External ID`,
    icon: 'IconHash',
    defaultValue: null,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  externalId: string | null;

  @WorkspaceField({
    standardId: MESSAGE_FOLDER_STANDARD_FIELD_IDS.pendingSyncAction,
    type: FieldMetadataType.SELECT,
    label: msg`Pending Sync Action`,
    description: msg`Pending action for folder sync`,
    icon: 'IconReload',
    options: [
      {
        value: MessageFolderPendingSyncAction.FOLDER_DELETION,
        label: 'Folder deletion',
        position: 0,
        color: 'red',
      },
      {
        value: MessageFolderPendingSyncAction.NONE,
        label: 'None',
        position: 1,
        color: 'blue',
      },
    ],
    defaultValue: `'${MessageFolderPendingSyncAction.NONE}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  pendingSyncAction: MessageFolderPendingSyncAction;

  @WorkspaceJoinColumn('messageChannel')
  messageChannelId: string;
}
