import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  ObjectMetadata,
  FieldMetadata,
  IsNullable,
  IsSystem,
} from 'src/workspace/workspace-manager/decorators/metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-manager/standard-objects/base.object-metadata';

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
    icon: null,
  })
  fieldMetadataId: string;

  // TODO: We could create a relation decorator but let's keep it simple for now.
  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'View',
    description: 'View Sort related view',
    icon: 'IconLayoutCollage',
  })
  @IsNullable()
  view?: object;
}
