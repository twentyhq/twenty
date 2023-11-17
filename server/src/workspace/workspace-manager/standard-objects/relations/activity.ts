import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

const activityRelationMetadata = [
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'activityV2',
    toObjectNameSingular: 'activityTargetV2',
    fromFieldMetadataName: 'activityTargets',
    toFieldMetadataName: 'activity',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'activityV2',
    toObjectNameSingular: 'attachmentV2',
    fromFieldMetadataName: 'attachments',
    toFieldMetadataName: 'activity',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'activityV2',
    toObjectNameSingular: 'commentV2',
    fromFieldMetadataName: 'comments',
    toFieldMetadataName: 'activity',
  },
];

export default activityRelationMetadata;
