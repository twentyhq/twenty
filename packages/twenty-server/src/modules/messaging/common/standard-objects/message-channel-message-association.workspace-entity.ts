import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

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
import {
  MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS,
  MESSAGE_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.messageChannelMessageAssociation,

  namePlural: 'messageChannelMessageAssociations',
  labelSingular: msg`Message Channel Message Association`,
  labelPlural: msg`Message Channel Message Associations`,
  description: msg`Message Synced with a Message Channel`,
  icon: STANDARD_OBJECT_ICONS.messageChannelMessageAssociation,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
@WorkspaceIndex(['messageChannelId', 'messageId'], {
  isUnique: true,
  indexWhereClause: '"deletedAt" IS NULL',
})
export class MessageChannelMessageAssociationWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageExternalId,
    type: FieldMetadataType.TEXT,
    label: msg`Message External Id`,
    description: msg`Message id from the messaging provider`,
    icon: 'IconHash',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  messageExternalId: string | null;

  @WorkspaceField({
    standardId:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageThreadExternalId,
    type: FieldMetadataType.TEXT,
    label: msg`Thread External Id`,
    description: msg`Thread id from the messaging provider`,
    icon: 'IconHash',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  messageThreadExternalId: string | null;

  @WorkspaceField({
    standardId: MESSAGE_STANDARD_FIELD_IDS.direction,
    type: FieldMetadataType.SELECT,
    label: msg`Direction`,
    description: msg`Message Direction`,
    icon: 'IconDirection',
    options: [
      {
        value: MessageDirection.INCOMING,
        label: 'Incoming',
        position: 0,
        color: 'green',
      },
      {
        value: MessageDirection.OUTGOING,
        label: 'Outgoing',
        position: 1,
        color: 'blue',
      },
    ],
    defaultValue: `'${MessageDirection.INCOMING}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  direction: MessageDirection;

  @WorkspaceRelation({
    standardId:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageChannel,
    type: RelationType.MANY_TO_ONE,
    label: msg`Message Channel Id`,
    description: msg`Message Channel Id`,
    icon: 'IconHash',
    inverseSideTarget: () => MessageChannelWorkspaceEntity,
    inverseSideFieldKey: 'messageChannelMessageAssociations',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  messageChannel: Relation<MessageChannelWorkspaceEntity> | null;

  @WorkspaceJoinColumn('messageChannel')
  messageChannelId: string;

  @WorkspaceRelation({
    standardId: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.message,
    type: RelationType.MANY_TO_ONE,
    label: msg`Message Id`,
    description: msg`Message Id`,
    icon: 'IconHash',
    inverseSideTarget: () => MessageWorkspaceEntity,
    inverseSideFieldKey: 'messageChannelMessageAssociations',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  message: Relation<MessageWorkspaceEntity> | null;

  @WorkspaceJoinColumn('message')
  messageId: string;
}
