import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  ObjectMetadata,
  IsSystem,
  FieldMetadata,
  IsNullable,
} from 'src/workspace/workspace-sync-metadata/decorators/metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { ViewObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/view.object-metadata';

@ObjectMetadata({
  namePlural: 'viewFilters',
  labelSingular: 'View Filter',
  labelPlural: 'View Filters',
  description: '(System) View Filters',
  icon: 'IconFilterBolt',
})
@IsSystem()
export class ViewFilterObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.UUID,
    label: 'Field Metadata Id',
    description: 'View Filter target field',
    icon: null,
  })
  fieldMetadataId: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Operand',
    description: 'View Filter operand',
    icon: null,
    defaultValue: { value: 'Contains' },
  })
  operand: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Value',
    description: 'View Filter value',
    icon: null,
    defaultValue: { value: '' },
  })
  value: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Display Value',
    description: 'View Filter Display Value',
    icon: null,
    defaultValue: { value: '' },
  })
  displayValue: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'View',
    description: 'View Filter related view',
    icon: 'IconLayoutCollage',
    joinColumn: 'viewId',
  })
  @IsNullable()
  view: ViewObjectMetadata;
}
