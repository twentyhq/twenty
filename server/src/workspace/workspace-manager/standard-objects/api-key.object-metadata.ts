import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  FieldMetadata,
  IsNullable,
  IsSystem,
  ObjectMetadata,
} from 'src/workspace/workspace-manager/decorators/metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-manager/standard-objects/base.object-metadata';

@ObjectMetadata({
  namePlural: 'apiKeys',
  labelSingular: 'Api Key',
  labelPlural: 'Api Keys',
  description: 'A api key',
  icon: 'IconRobot',
})
@IsSystem()
export class ApiKeyObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'ApiKey name',
    icon: 'IconLink',
    defaultValue: { value: '' },
  })
  name: string;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Expiration date',
    description: 'ApiKey expiration date',
    icon: 'IconCalendar',
  })
  expiresAt: Date;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Revocation date',
    description: 'ApiKey revocation date',
    icon: 'IconCalendar',
  })
  @IsNullable()
  revokedAt?: Date;
}
