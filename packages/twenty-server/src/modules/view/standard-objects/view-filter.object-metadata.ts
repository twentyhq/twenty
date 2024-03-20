import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { viewFilterStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { ViewObjectMetadata } from 'src/modules/view/standard-objects/view.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.viewFilter,
  namePlural: 'viewFilters',
  labelSingular: 'View Filter',
  labelPlural: 'View Filters',
  description: '(System) View Filters',
  icon: 'IconFilterBolt',
})
@IsSystem()
export class ViewFilterObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: viewFilterStandardFieldIds.fieldMetadataId,
    type: FieldMetadataType.UUID,
    label: 'Field Metadata Id',
    description: 'View Filter target field',
  })
  fieldMetadataId: string;

  @FieldMetadata({
    standardId: viewFilterStandardFieldIds.operand,
    type: FieldMetadataType.TEXT,
    label: 'Operand',
    description: 'View Filter operand',
    defaultValue: { value: "'Contains'" },
  })
  operand: string;

  @FieldMetadata({
    standardId: viewFilterStandardFieldIds.value,
    type: FieldMetadataType.TEXT,
    label: 'Value',
    description: 'View Filter value',
  })
  value: string;

  @FieldMetadata({
    standardId: viewFilterStandardFieldIds.displayValue,
    type: FieldMetadataType.TEXT,
    label: 'Display Value',
    description: 'View Filter Display Value',
  })
  displayValue: string;

  @FieldMetadata({
    standardId: viewFilterStandardFieldIds.view,
    type: FieldMetadataType.RELATION,
    label: 'View',
    description: 'View Filter related view',
    icon: 'IconLayoutCollage',
    joinColumn: 'viewId',
  })
  @IsNullable()
  view: ViewObjectMetadata;
}
