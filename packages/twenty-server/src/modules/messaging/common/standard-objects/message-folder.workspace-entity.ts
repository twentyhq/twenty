import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MESSAGE_FOLDER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

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
export class MessageFolderWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MESSAGE_FOLDER_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Folder name`,
    icon: 'IconFolder',
  })
  name: string;

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
  messageChannel: Relation<MessageChannelWorkspaceEntity>;

  @WorkspaceField({
    standardId: MESSAGE_FOLDER_STANDARD_FIELD_IDS.syncCursor,
    type: FieldMetadataType.TEXT,
    label: msg`Sync Cursor`,
    description: msg`Sync Cursor`,
    icon: 'IconHash',
  })
  syncCursor: string;

  @WorkspaceField({
    standardId: MESSAGE_FOLDER_STANDARD_FIELD_IDS.isSentFolder,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Sent Folder`,
    description: msg`Is Sent Folder`,
    icon: 'IconCheck',
    defaultValue: false,
  })
  isSentFolder: boolean;

  @WorkspaceField({
    standardId: MESSAGE_FOLDER_STANDARD_FIELD_IDS.isSynced,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Synced`,
    description: msg`Is Synced`,
    icon: 'IconCheck',
    defaultValue: false,
  })
  isSynced: boolean;

  @WorkspaceField({
    standardId: MESSAGE_FOLDER_STANDARD_FIELD_IDS.externalId,
    type: FieldMetadataType.TEXT,
    label: msg`External ID`,
    description: msg`External ID`,
    icon: 'IconHash',
    defaultValue: null,
  })
  @WorkspaceIsNullable()
  externalId: string | null;

  @WorkspaceJoinColumn('messageChannel')
  messageChannelId: string;
}
