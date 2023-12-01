import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

const companyRelationMetadata = [
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'company',
    toObjectNameSingular: 'person',
    fromFieldMetadataName: 'people',
    toFieldMetadataName: 'company',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'company',
    toObjectNameSingular: 'favorite',
    fromFieldMetadataName: 'favorites',
    toFieldMetadataName: 'company',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'company',
    toObjectNameSingular: 'attachment',
    fromFieldMetadataName: 'attachments',
    toFieldMetadataName: 'company',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'company',
    toObjectNameSingular: 'opportunity',
    fromFieldMetadataName: 'opportunities',
    toFieldMetadataName: 'company',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'company',
    toObjectNameSingular: 'activityTarget',
    fromFieldMetadataName: 'activityTargets',
    toFieldMetadataName: 'company',
  },
];

export default companyRelationMetadata;
