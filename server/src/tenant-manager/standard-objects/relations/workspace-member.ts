import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

const workspaceMemberRelationMetadata = [
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'workspaceMemberV2',
    toObjectNameSingular: 'companyV2',
    fromFieldMetadataName: 'accountOwnerForCompanies',
    toFieldMetadataName: 'accountOwner',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'workspaceMemberV2',
    toObjectNameSingular: 'favoriteV2',
    fromFieldMetadataName: 'favorites',
    toFieldMetadataName: 'workspaceMember',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'workspaceMemberV2',
    toObjectNameSingular: 'activityV2',
    fromFieldMetadataName: 'authoredActivities',
    toFieldMetadataName: 'author',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'workspaceMemberV2',
    toObjectNameSingular: 'activityV2',
    fromFieldMetadataName: 'assignedActivities',
    toFieldMetadataName: 'assignee',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'workspaceMemberV2',
    toObjectNameSingular: 'commentV2',
    fromFieldMetadataName: 'authoredComments',
    toFieldMetadataName: 'author',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'workspaceMemberV2',
    toObjectNameSingular: 'attachmentV2',
    fromFieldMetadataName: 'authoredAttachments',
    toFieldMetadataName: 'author',
  },
];

export default workspaceMemberRelationMetadata;
