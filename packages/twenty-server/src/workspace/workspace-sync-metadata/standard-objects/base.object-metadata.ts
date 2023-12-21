import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';

export abstract class BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.UUID,
    label: 'Id',
    defaultValue: { type: 'uuid' },
  })
  @IsSystem()
  id: string;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Creation date',
    icon: 'IconCalendar',
    defaultValue: { type: 'now' },
  })
  createdAt: Date;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Update date',
    icon: 'IconCalendar',
    defaultValue: { type: 'now' },
  })
  @IsSystem()
  updatedAt: Date;
}
