import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  ObjectMetadata,
  FieldMetadata,
  IsNullable,
  IsSystem,
} from 'src/workspace/workspace-sync-metadata/decorators/metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { ViewObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/view.object-metadata';

@ObjectMetadata({
  namePlural: 'viewSorts',
  labelSingular: 'View Sort',
  labelPlural: 'View Sorts',
  description: '(System) View Sorts',
  icon: 'IconArrowsSort',
})
@IsSystem()
export class ViewSortObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.UUID,
    label: 'Field Metadata Id',
    description: 'View Sort target field',
    icon: 'IconTag',
  })
  fieldMetadataId: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Direction',
    description: 'View Sort direction',
    icon: null,
    defaultValue: { value: 'asc' },
  })
  direction: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'View',
    description: 'View Sort related view',
    icon: 'IconLayoutCollage',
    joinColumn: 'viewId',
  })
  @IsNullable()
  view: ViewObjectMetadata;
}
