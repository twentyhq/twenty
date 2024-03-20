import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { baseObjectStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';

export abstract class BaseObjectMetadata {
  @FieldMetadata({
    standardId: baseObjectStandardFieldIds.id,
    type: FieldMetadataType.UUID,
    label: 'Id',
    description: 'Id',
    defaultValue: { value: 'uuid' },
    icon: 'Icon123',
  })
  @IsSystem()
  id: string;

  @FieldMetadata({
    standardId: baseObjectStandardFieldIds.createdAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Creation date',
    description: 'Creation date',
    icon: 'IconCalendar',
    defaultValue: { value: 'now' },
  })
  createdAt: Date;

  @FieldMetadata({
    standardId: baseObjectStandardFieldIds.updatedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Update date',
    description: 'Update date',
    icon: 'IconCalendar',
    defaultValue: { value: 'now' },
  })
  @IsSystem()
  updatedAt: Date;
}
