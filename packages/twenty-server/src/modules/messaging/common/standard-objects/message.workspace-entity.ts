import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MESSAGE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.message,

  namePlural: 'messages',
  labelSingular: msg`Message`,
  labelPlural: msg`Messages`,
  description: msg`A message sent or received through a messaging channel (email, chat, etc.)`,
  icon: STANDARD_OBJECT_ICONS.message,
  labelIdentifierStandardId: MESSAGE_STANDARD_FIELD_IDS.subject,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class MessageWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MESSAGE_STANDARD_FIELD_IDS.headerMessageId,
    type: FieldMetadataType.TEXT,
    label: msg`Header message Id`,
    description: msg`Message id from the message header`,
    icon: 'IconHash',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  headerMessageId: string | null;

  @WorkspaceField({
    standardId: MESSAGE_STANDARD_FIELD_IDS.subject,
    type: FieldMetadataType.TEXT,
    label: msg`Subject`,
    description: msg`Subject`,
    icon: 'IconMessage',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  subject: string | null;

  @WorkspaceField({
    standardId: MESSAGE_STANDARD_FIELD_IDS.text,
    type: FieldMetadataType.TEXT,
    label: msg`Text`,
    description: msg`Text`,
    icon: 'IconMessage',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  text: string | null;

  @WorkspaceField({
    standardId: MESSAGE_STANDARD_FIELD_IDS.receivedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Received At`,
    description: msg`The date the message was received`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  receivedAt: Date | null;

  @WorkspaceRelation({
    standardId: MESSAGE_STANDARD_FIELD_IDS.messageThread,
    type: RelationType.MANY_TO_ONE,
    label: msg`Message Thread Id`,
    description: msg`Message Thread Id`,
    icon: 'IconHash',
    inverseSideTarget: () => MessageThreadWorkspaceEntity,
    inverseSideFieldKey: 'messages',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  messageThread: Relation<MessageThreadWorkspaceEntity> | null;

  @WorkspaceJoinColumn('messageThread')
  messageThreadId: string | null;

  @WorkspaceRelation({
    standardId: MESSAGE_STANDARD_FIELD_IDS.messageParticipants,
    type: RelationType.ONE_TO_MANY,
    label: msg`Message Participants`,
    description: msg`Message Participants`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => MessageParticipantWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  messageParticipants: Relation<MessageParticipantWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MESSAGE_STANDARD_FIELD_IDS.messageChannelMessageAssociations,
    type: RelationType.ONE_TO_MANY,
    label: msg`Message Channel Association`,
    description: msg`Messages from the channel.`,
    icon: 'IconMessage',
    inverseSideTarget: () => MessageChannelMessageAssociationWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  messageChannelMessageAssociations: Relation<
    MessageChannelMessageAssociationWorkspaceEntity[]
  >;
}
