import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  MessageParticipantRole,
  RelationOnDeleteAction,
} from 'twenty-shared/types';

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
import { MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.messageParticipant,

  namePlural: 'messageParticipants',
  labelSingular: msg`Message Participant`,
  labelPlural: msg`Message Participants`,
  description: msg`Message Participants`,
  icon: STANDARD_OBJECT_ICONS.messageParticipant,
  labelIdentifierStandardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.handle,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class MessageParticipantWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.role,
    type: FieldMetadataType.SELECT,
    label: msg`Role`,
    description: msg`Role`,
    icon: 'IconAt',
    options: [
      {
        value: MessageParticipantRole.FROM,
        label: 'From',
        position: 0,
        color: 'green',
      },
      {
        value: MessageParticipantRole.TO,
        label: 'To',
        position: 1,
        color: 'blue',
      },
      {
        value: MessageParticipantRole.CC,
        label: 'Cc',
        position: 2,
        color: 'orange',
      },
      {
        value: MessageParticipantRole.BCC,
        label: 'Bcc',
        position: 3,
        color: 'red',
      },
    ],
    defaultValue: `'${MessageParticipantRole.FROM}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  role: MessageParticipantRole;

  @WorkspaceField({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: msg`Handle`,
    description: msg`Handle`,
    icon: 'IconAt',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  handle: string | null;

  @WorkspaceField({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.displayName,
    type: FieldMetadataType.TEXT,
    label: msg`Display Name`,
    description: msg`Display Name`,
    icon: 'IconUser',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  displayName: string | null;

  @WorkspaceRelation({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.message,
    type: RelationType.MANY_TO_ONE,
    label: msg`Message`,
    description: msg`Message`,
    icon: 'IconMessage',
    inverseSideTarget: () => MessageWorkspaceEntity,
    inverseSideFieldKey: 'messageParticipants',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  message: Relation<MessageWorkspaceEntity>;

  @WorkspaceJoinColumn('message')
  messageId: string;

  @WorkspaceRelation({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.person,
    type: RelationType.MANY_TO_ONE,
    label: msg`Person`,
    description: msg`Person`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'messageParticipants',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  person: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceJoinColumn('person')
  personId: string | null;

  @WorkspaceRelation({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.workspaceMember,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workspace Member`,
    description: msg`Workspace member`,
    icon: 'IconCircleUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'messageParticipants',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('workspaceMember')
  workspaceMemberId: string | null;
}
