import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { MessageObjectMetadata } from 'src/modules/messaging/standard-objects/message.object-metadata';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { IsNotAuditLogged } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-not-audit-logged.decorator';

@ObjectMetadata({
  standardId: STANDARD_OBJECT_IDS.messageParticipant,
  namePlural: 'messageParticipants',
  labelSingular: 'Message Participant',
  labelPlural: 'Message Participants',
  description: 'Message Participants',
  icon: 'IconUserCircle',
})
@IsNotAuditLogged()
@IsSystem()
export class MessageParticipantObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.message,
    type: FieldMetadataType.RELATION,
    label: 'Message',
    description: 'Message',
    icon: 'IconMessage',
    joinColumn: 'messageId',
  })
  message: Relation<MessageObjectMetadata>;

  @FieldMetadata({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.role,
    type: FieldMetadataType.SELECT,
    label: 'Role',
    description: 'Role',
    icon: 'IconAt',
    options: [
      { value: 'from', label: 'From', position: 0, color: 'green' },
      { value: 'to', label: 'To', position: 1, color: 'blue' },
      { value: 'cc', label: 'Cc', position: 2, color: 'orange' },
      { value: 'bcc', label: 'Bcc', position: 3, color: 'red' },
    ],
    defaultValue: "'from'",
  })
  role: string;

  @FieldMetadata({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconAt',
  })
  handle: string;

  @FieldMetadata({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.displayName,
    type: FieldMetadataType.TEXT,
    label: 'Display Name',
    description: 'Display Name',
    icon: 'IconUser',
  })
  displayName: string;

  @FieldMetadata({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.person,
    type: FieldMetadataType.RELATION,
    label: 'Person',
    description: 'Person',
    icon: 'IconUser',
    joinColumn: 'personId',
  })
  @IsNullable()
  person: Relation<PersonObjectMetadata>;

  @FieldMetadata({
    standardId: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS.workspaceMember,
    type: FieldMetadataType.RELATION,
    label: 'Workspace Member',
    description: 'Workspace member',
    icon: 'IconCircleUser',
    joinColumn: 'workspaceMemberId',
  })
  @IsNullable()
  workspaceMember: Relation<WorkspaceMemberObjectMetadata>;
}
