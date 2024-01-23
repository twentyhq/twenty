import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/workspace/workspace-sync-metadata/decorators/gate.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { MessageObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message.object-metadata';
import { PersonObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/workspace-member.object-metadata';

@ObjectMetadata({
  namePlural: 'messageParticipants',
  labelSingular: 'Message Participant',
  labelPlural: 'Message Participants',
  description: 'Message Participants',
  icon: 'IconUserCircle',
})
@Gate({
  featureFlag: 'IS_MESSAGING_ENABLED',
})
@IsSystem()
export class MessageParticipantObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Message',
    description: 'Message',
    icon: 'IconMessage',
    joinColumn: 'messageId',
  })
  message: MessageObjectMetadata;

  @FieldMetadata({
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
    defaultValue: { value: 'from' },
  })
  role: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconAt',
  })
  handle: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Display Name',
    description: 'Display Name',
    icon: 'IconUser',
  })
  displayName: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Person',
    description: 'Person',
    icon: 'IconUser',
    joinColumn: 'personId',
  })
  @IsNullable()
  person: PersonObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Workspace Member',
    description: 'Workspace member',
    icon: 'IconCircleUser',
    joinColumn: 'workspaceMemberId',
  })
  @IsNullable()
  workspaceMember: WorkspaceMemberObjectMetadata;
}
