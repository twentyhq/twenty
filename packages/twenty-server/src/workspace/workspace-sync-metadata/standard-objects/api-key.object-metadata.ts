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
    label: 'نام',
    description: 'ApiKey نام',
    icon: 'IconLink',
  })
  name: string;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'تاریخ انقضا',
    description: 'ApiKey تاریخ انقضا',
    icon: 'IconCalendar',
  })
  expiresAt: Date;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'تاریخ ابطال',
    description: 'ApiKey تاریخ ابطال',
    icon: 'IconCalendar',
  })
  @IsNullable()
  revokedAt?: Date;
}
