import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { viewFieldStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { ViewObjectMetadata } from 'src/modules/view/standard-objects/view.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.viewField,
  namePlural: 'viewFields',
  labelSingular: 'View Field',
  labelPlural: 'View Fields',
  description: '(System) View Fields',
  icon: 'IconTag',
})
@IsSystem()
export class ViewFieldObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: viewFieldStandardFieldIds.fieldMetadataId,
    type: FieldMetadataType.UUID,
    label: 'Field Metadata Id',
    description: 'View Field target field',
    icon: 'IconTag',
  })
  fieldMetadataId: string;

  @FieldMetadata({
    standardId: viewFieldStandardFieldIds.isVisible,
    type: FieldMetadataType.BOOLEAN,
    label: 'Visible',
    description: 'View Field visibility',
    icon: 'IconEye',
    defaultValue: true,
  })
  isVisible: boolean;

  @FieldMetadata({
    standardId: viewFieldStandardFieldIds.size,
    type: FieldMetadataType.NUMBER,
    label: 'Size',
    description: 'View Field size',
    icon: 'IconEye',
    defaultValue: 0,
  })
  size: number;

  @FieldMetadata({
    standardId: viewFieldStandardFieldIds.position,
    type: FieldMetadataType.NUMBER,
    label: 'Position',
    description: 'View Field position',
    icon: 'IconList',
    defaultValue: 0,
  })
  position: number;

  @FieldMetadata({
    standardId: viewFieldStandardFieldIds.view,
    type: FieldMetadataType.RELATION,
    label: 'View',
    description: 'View Field related view',
    icon: 'IconLayoutCollage',
    joinColumn: 'viewId',
  })
  @IsNullable()
  view?: ViewObjectMetadata;
}
