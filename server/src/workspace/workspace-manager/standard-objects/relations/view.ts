import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

const viewRelationMetadata = [
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'view',
    toObjectNameSingular: 'viewField',
    fromFieldMetadataName: 'viewFields',
    toFieldMetadataName: 'view',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'view',
    toObjectNameSingular: 'viewFilter',
    fromFieldMetadataName: 'viewFilters',
    toFieldMetadataName: 'view',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'view',
    toObjectNameSingular: 'viewSort',
    fromFieldMetadataName: 'viewSorts',
    toFieldMetadataName: 'view',
  },
];

export default viewRelationMetadata;
