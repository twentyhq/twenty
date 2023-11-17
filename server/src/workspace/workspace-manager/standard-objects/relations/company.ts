import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

const companyRelationMetadata = [
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'companyV2',
    toObjectNameSingular: 'personV2',
    fromFieldMetadataName: 'people',
    toFieldMetadataName: 'company',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'companyV2',
    toObjectNameSingular: 'favoriteV2',
    fromFieldMetadataName: 'favorites',
    toFieldMetadataName: 'company',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'companyV2',
    toObjectNameSingular: 'attachmentV2',
    fromFieldMetadataName: 'attachments',
    toFieldMetadataName: 'company',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'companyV2',
    toObjectNameSingular: 'opportunityV2',
    fromFieldMetadataName: 'opportunities',
    toFieldMetadataName: 'company',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'companyV2',
    toObjectNameSingular: 'activityTargetV2',
    fromFieldMetadataName: 'activityTargets',
    toFieldMetadataName: 'company',
  },
];

export default companyRelationMetadata;
