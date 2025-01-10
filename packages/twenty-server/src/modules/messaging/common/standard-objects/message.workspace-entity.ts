import { FieldMetadataType } from 'twenty-shared';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MESSAGE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.message,
  namePlural: 'messages',
  labelSingular: 'Message',
  labelPlural: 'Messages',
  description: 'Message',
  icon: STANDARD_OBJECT_ICONS.message,
  labelIdentifierStandardId: MESSAGE_STANDARD_FIELD_IDS.subject,
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
  receivedAt: Date | null;

  @WorkspaceRelation({
    standardId: MESSAGE_STANDARD_FIELD_IDS.messageThread,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Message Thread Id',
    description: 'Message Thread Id',
    icon: 'IconHash',
    inverseSideTarget: () => MessageThreadWorkspaceEntity,
    inverseSideFieldKey: 'messages',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  messageThread: Relation<MessageThreadWorkspaceEntity> | null;

  @WorkspaceJoinColumn('messageThread')
  messageThreadId: string | null;

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
