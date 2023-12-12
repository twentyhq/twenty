import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  ObjectMetadata,
  IsSystem,
  FieldMetadata,
  IsNullable,
} from 'src/workspace/workspace-sync-metadata/decorators/metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';

@ObjectMetadata({
  namePlural: 'messageThreads',
  labelSingular: 'Message Thread',
  labelPlural: 'Message Threads',
  description: 'Message Thread',
  icon: 'IconMessage',
})
@IsSystem()
export class MessageThreadObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    // will be an array
    type: FieldMetadataType.TEXT,
    label: 'External Ids',
    description: 'Thread ids from the messaging provider',
    icon: 'IconMessage',
  })
  @IsNullable()
  externalIds: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Subject',
    description: 'Subject',
    icon: 'IconMessage',
  })
  @IsNullable()
  subject: string;

  @FieldMetadata({
    // This will be a type select later: default, subject, share_everything
    type: FieldMetadataType.TEXT,
    label: 'Visibility',
    description: 'Visibility',
    icon: 'IconEyeglass',
    defaultValue: { value: 'default' },
  })
  @IsNullable()
  visibility: string;
}
