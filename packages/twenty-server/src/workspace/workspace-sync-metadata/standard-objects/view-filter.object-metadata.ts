import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
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
  })
  fieldMetadataId: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Operand',
    description: 'View Filter operand',
    defaultValue: { value: 'Contains' },
  })
  operand: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Value',
    description: 'View Filter value',
  })
  value: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Display Value',
    description: 'View Filter Display Value',
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
