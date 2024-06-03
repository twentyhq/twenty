import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { MESSAGE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.message,
  namePlural: 'messages',
  labelSingular: 'Message',
  labelPlural: 'Messages',
  description: 'Message',
  icon: 'IconMessage',
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class MessageWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MESSAGE_STANDARD_FIELD_IDS.headerMessageId,
    type: FieldMetadataType.TEXT,
    label: 'Header message Id',
    description: 'Message id from the message header',
    icon: 'IconHash',
  })
  headerMessageId: string;

  @WorkspaceField({
    standardId: MESSAGE_STANDARD_FIELD_IDS.direction,
    type: FieldMetadataType.SELECT,
    label: 'Direction',
    description: 'Message Direction',
    icon: 'IconDirection',
    options: [
      { value: 'incoming', label: 'Incoming', position: 0, color: 'green' },
      { value: 'outgoing', label: 'Outgoing', position: 1, color: 'blue' },
    ],
    defaultValue: "'incoming'",
  })
  direction: string;

  @WorkspaceField({
    standardId: MESSAGE_STANDARD_FIELD_IDS.subject,
    type: FieldMetadataType.TEXT,
    label: 'Subject',
    description: 'Subject',
    icon: 'IconMessage',
  })
  subject: string;

  @WorkspaceField({
    standardId: MESSAGE_STANDARD_FIELD_IDS.text,
    type: FieldMetadataType.TEXT,
    label: 'Text',
    description: 'Text',
    icon: 'IconMessage',
  })
  text: string;

  @WorkspaceField({
    standardId: MESSAGE_STANDARD_FIELD_IDS.receivedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Received At',
    description: 'The date the message was received',
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  receivedAt: string;

  @WorkspaceRelation({
    standardId: MESSAGE_STANDARD_FIELD_IDS.messageThread,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Message Thread Id',
    description: 'Message Thread Id',
    icon: 'IconHash',
    joinColumn: 'messageThreadId',
    inverseSideTarget: () => MessageThreadWorkspaceEntity,
    inverseSideFieldKey: 'messages',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  messageThread: Relation<MessageThreadWorkspaceEntity>;

  @WorkspaceRelation({
    standardId: MESSAGE_STANDARD_FIELD_IDS.messageParticipants,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Message Participants',
    description: 'Message Participants',
    icon: 'IconUserCircle',
    inverseSideTarget: () => MessageParticipantWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  messageParticipants: Relation<MessageParticipantWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MESSAGE_STANDARD_FIELD_IDS.messageChannelMessageAssociations,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Message Channel Association',
    description: 'Messages from the channel.',
    icon: 'IconMessage',
    inverseSideTarget: () => MessageChannelMessageAssociationWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  messageChannelMessageAssociations: Relation<
    MessageChannelMessageAssociationWorkspaceEntity[]
  >;
}
