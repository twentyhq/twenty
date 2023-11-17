import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

const personRelationMetadata = [
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'personV2',
    toObjectNameSingular: 'favoriteV2',
    fromFieldMetadataName: 'favorites',
    toFieldMetadataName: 'person',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'personV2',
    toObjectNameSingular: 'attachmentV2',
    fromFieldMetadataName: 'attachments',
    toFieldMetadataName: 'person',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'personV2',
    toObjectNameSingular: 'opportunityV2',
    fromFieldMetadataName: 'opportunities',
    toFieldMetadataName: 'person',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'personV2',
    toObjectNameSingular: 'opportunityV2',
    fromFieldMetadataName: 'pointOfContactForOpportunities',
    toFieldMetadataName: 'pointOfContact',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'personV2',
    toObjectNameSingular: 'activityTargetV2',
    fromFieldMetadataName: 'activityTargets',
    toFieldMetadataName: 'person',
  },
];

export default personRelationMetadata;
