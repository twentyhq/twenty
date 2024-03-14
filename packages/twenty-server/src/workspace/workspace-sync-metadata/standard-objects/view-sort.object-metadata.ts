import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { viewSortStandardFieldIds } from 'src/workspace/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/workspace/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { ViewObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/view.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.viewSort,
  namePlural: 'viewSorts',
  labelSingular: 'View Sort',
  labelPlural: 'View Sorts',
  description: '(System) View Sorts',
  icon: 'IconArrowsSort',
})
@IsSystem()
export class ViewSortObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: viewSortStandardFieldIds.fieldMetadataId,
    type: FieldMetadataType.UUID,
    label: 'Field Metadata Id',
    description: 'View Sort target field',
    icon: 'IconTag',
  })
  fieldMetadataId: string;

  @FieldMetadata({
    standardId: viewSortStandardFieldIds.direction,
    type: FieldMetadataType.TEXT,
    label: 'Direction',
    description: 'View Sort direction',
    defaultValue: { value: 'asc' },
  })
  direction: string;

  @FieldMetadata({
    standardId: viewSortStandardFieldIds.view,
    type: FieldMetadataType.RELATION,
    label: 'View',
    description: 'View Sort related view',
    icon: 'IconLayoutCollage',
    joinColumn: 'viewId',
  })
  @IsNullable()
  view: ViewObjectMetadata;
}
