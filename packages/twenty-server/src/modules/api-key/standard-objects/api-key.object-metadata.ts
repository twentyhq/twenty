import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { apiKeyStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.apiKey,
  namePlural: 'apiKeys',
  labelSingular: 'Api Key',
  labelPlural: 'Api Keys',
  description: 'An api key',
  icon: 'IconRobot',
})
@IsSystem()
export class ApiKeyObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: apiKeyStandardFieldIds.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'ApiKey name',
    icon: 'IconLink',
  })
  name: string;

  @FieldMetadata({
    standardId: apiKeyStandardFieldIds.expiresAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Expiration date',
    description: 'ApiKey expiration date',
    icon: 'IconCalendar',
  })
  expiresAt: Date;

  @FieldMetadata({
    standardId: apiKeyStandardFieldIds.revokedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Revocation date',
    description: 'ApiKey revocation date',
    icon: 'IconCalendar',
  })
  @IsNullable()
  revokedAt?: Date;
}
