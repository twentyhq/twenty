import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

const viewRelationMetadata = [
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'viewV2',
    toObjectNameSingular: 'viewFieldV2',
    fromFieldMetadataName: 'viewFields',
    toFieldMetadataName: 'view',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'viewV2',
    toObjectNameSingular: 'viewFilterV2',
    fromFieldMetadataName: 'viewFilters',
    toFieldMetadataName: 'view',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'viewV2',
    toObjectNameSingular: 'viewSortV2',
    fromFieldMetadataName: 'viewSorts',
    toFieldMetadataName: 'view',
  },
];

export default viewRelationMetadata;
