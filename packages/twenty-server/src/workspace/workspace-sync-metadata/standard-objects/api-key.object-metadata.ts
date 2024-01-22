import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';

@ObjectMetadata({
  namePlural: 'apiKeys',
  labelSingular: 'Api Key',
  labelPlural: 'Api Keys',
  description: 'An api key',
  icon: 'IconRobot',
})
@IsSystem()
export class ApiKeyObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'ApiKey name',
    icon: 'IconLink',
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
