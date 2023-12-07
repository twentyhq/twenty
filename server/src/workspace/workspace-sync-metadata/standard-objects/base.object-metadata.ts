import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  FieldMetadata,
  IsSystem,
} from 'src/workspace/workspace-sync-metadata/decorators/metadata.decorator';

export abstract class BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.UUID,
    label: 'Id',
    icon: null,
    description: null,
    defaultValue: { type: 'uuid' },
  })
  @IsSystem()
  id: string;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Creation date',
    description: null,
    icon: 'IconCalendar',
    defaultValue: { type: 'now' },
  })
  createdAt: Date;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Update date',
    description: null,
    icon: 'IconCalendar',
    defaultValue: { type: 'now' },
  })
  @IsSystem()
  updatedAt: Date;
}
