import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

const personRelationMetadata = [
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'person',
    toObjectNameSingular: 'favorite',
    fromFieldMetadataName: 'favorites',
    toFieldMetadataName: 'person',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'person',
    toObjectNameSingular: 'attachment',
    fromFieldMetadataName: 'attachments',
    toFieldMetadataName: 'person',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'person',
    toObjectNameSingular: 'opportunity',
    fromFieldMetadataName: 'opportunities',
    toFieldMetadataName: 'person',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'person',
    toObjectNameSingular: 'opportunity',
    fromFieldMetadataName: 'pointOfContactForOpportunities',
    toFieldMetadataName: 'pointOfContact',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'person',
    toObjectNameSingular: 'activityTarget',
    fromFieldMetadataName: 'activityTargets',
    toFieldMetadataName: 'person',
  },
];

export default personRelationMetadata;
