import { msg } from '@lingui/core/macro';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { createBaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIndex } from 'src/engine/twenty-orm/decorators/workspace-index.decorator';
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
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object.constant';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

@WorkspaceEntity({
  universalIdentifier: STANDARD_OBJECT_IDS.messageChannelMessageAssociation,

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
  universalIdentifier: '20202020-0c30-47c2-a229-0af114b1565e',
})
export class MessageChannelMessageAssociationWorkspaceEntity extends createBaseWorkspaceEntity(
  {
    id: STANDARD_OBJECTS.messageChannelMessageAssociation.fields.id
      .universalIdentifier,
    createdAt:
      STANDARD_OBJECTS.messageChannelMessageAssociation.fields.createdAt
        .universalIdentifier,
    updatedAt:
      STANDARD_OBJECTS.messageChannelMessageAssociation.fields.updatedAt
        .universalIdentifier,
    deletedAt:
      STANDARD_OBJECTS.messageChannelMessageAssociation.fields.deletedAt
        .universalIdentifier,
  },
) {
  @WorkspaceField({
    universalIdentifier:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageExternalId,
    type: FieldMetadataType.TEXT,
    label: msg`Message External Id`,
    description: msg`Message id from the messaging provider`,
    icon: 'IconHash',
  })
  @WorkspaceIsNullable()
  messageExternalId: string | null;

  @WorkspaceField({
    universalIdentifier:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageThreadExternalId,
    type: FieldMetadataType.TEXT,
    label: msg`Thread External Id`,
    description: msg`Thread id from the messaging provider`,
    icon: 'IconHash',
  })
  @WorkspaceIsNullable()
  messageThreadExternalId: string | null;

  @WorkspaceField({
    universalIdentifier: MESSAGE_STANDARD_FIELD_IDS.direction,
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
  direction: MessageDirection;

  @WorkspaceRelation({
    universalIdentifier:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.messageChannel,
    type: RelationType.MANY_TO_ONE,
    label: msg`Message Channel Id`,
    description: msg`Message Channel Id`,
    icon: 'IconHash',
    inverseSideTarget: () => MessageChannelWorkspaceEntity,
    inverseSideFieldKey: 'messageChannelMessageAssociations',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  messageChannel: Relation<MessageChannelWorkspaceEntity> | null;

  @WorkspaceJoinColumn({
    relationPropertyKey: 'messageChannel',
    universalIdentifier: 'e8fed8e9-7f4c-5a14-bfd7-42339ff3859b',
  })
  messageChannelId: string;

  @WorkspaceRelation({
    universalIdentifier:
      MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS.message,
    type: RelationType.MANY_TO_ONE,
    label: msg`Message Id`,
    description: msg`Message Id`,
    icon: 'IconHash',
    inverseSideTarget: () => MessageWorkspaceEntity,
    inverseSideFieldKey: 'messageChannelMessageAssociations',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  message: Relation<MessageWorkspaceEntity> | null;

  @WorkspaceJoinColumn({
    relationPropertyKey: 'message',
    universalIdentifier: '2e08ce0e-cad1-5290-8af0-44a375ae5af9',
  })
  messageId: string;
}
