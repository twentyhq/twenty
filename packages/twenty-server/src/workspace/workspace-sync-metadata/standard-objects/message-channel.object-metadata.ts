import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  ObjectMetadata,
  IsSystem,
  FieldMetadata,
  IsNullable,
} from 'src/workspace/workspace-sync-metadata/decorators/metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';

@ObjectMetadata({
  namePlural: 'messageChannels',
  labelSingular: 'Message Channel',
  labelPlural: 'Message Channels',
  description: 'Message Channels',
  icon: 'IconMessage',
})
@IsSystem()
export class FavoriteObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Visibility',
    description: 'Visibility',
    icon: 'IconEyeglass',
    defaultValue: { value: 'metadata' },
  })
  visibility: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Address',
    description: 'Address',
    icon: 'IconAt',
  })
  address: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Connected Account',
    description: 'Connected Account',
    icon: 'IconUserCircle',
    joinColumn: 'connectedAccountId',
  })
  connectedAccount: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Type',
    description: 'Type',
    icon: 'IconMessage',
  })
  @IsNullable()
  type: string;
}
