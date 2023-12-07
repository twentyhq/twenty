import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import {
  ObjectMetadata,
  IsSystem,
  FieldMetadata,
  RelationMetadata,
} from 'src/workspace/workspace-sync-metadata/decorators/metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';

@ObjectMetadata({
  namePlural: 'views',
  labelSingular: 'View',
  labelPlural: 'Views',
  description: '(System) Views',
  icon: 'IconLayoutCollage',
})
@IsSystem()
export class ViewObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'View name',
    icon: null,
    defaultValue: { value: '' },
  })
  name: string;

  @FieldMetadata({
    type: FieldMetadataType.UUID,
    label: 'Object Metadata Id',
    description: 'View target object',
    icon: null,
  })
  objectMetadataId: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Type',
    description: 'View type',
    icon: null,
    defaultValue: { value: 'table' },
  })
  type: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'View Fields',
    description: 'View Fields',
    icon: 'IconTag',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'viewField',
  })
  viewFields: object[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'View Filters',
    description: 'View Filters',
    icon: 'IconFilterBolt',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'viewFilter',
  })
  viewFilters: object[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'View Sorts',
    description: 'View Sorts',
    icon: 'IconArrowsSort',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'viewSort',
  })
  viewSorts: object[];
}
