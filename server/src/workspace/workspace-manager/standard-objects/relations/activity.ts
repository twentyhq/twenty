import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

const activityRelationMetadata = [
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'activity',
    toObjectNameSingular: 'activityTarget',
    fromFieldMetadataName: 'activityTargets',
    toFieldMetadataName: 'activity',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'activity',
    toObjectNameSingular: 'attachment',
    fromFieldMetadataName: 'attachments',
    toFieldMetadataName: 'activity',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'activity',
    toObjectNameSingular: 'comment',
    fromFieldMetadataName: 'comments',
    toFieldMetadataName: 'activity',
  },
];

export default activityRelationMetadata;
