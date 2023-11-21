import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';

const workspaceMemberRelationMetadata = [
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'workspaceMember',
    toObjectNameSingular: 'company',
    fromFieldMetadataName: 'accountOwnerForCompanies',
    toFieldMetadataName: 'accountOwner',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'workspaceMember',
    toObjectNameSingular: 'favorite',
    fromFieldMetadataName: 'favorites',
    toFieldMetadataName: 'workspaceMember',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'workspaceMember',
    toObjectNameSingular: 'activity',
    fromFieldMetadataName: 'authoredActivities',
    toFieldMetadataName: 'author',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'workspaceMember',
    toObjectNameSingular: 'activity',
    fromFieldMetadataName: 'assignedActivities',
    toFieldMetadataName: 'assignee',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'workspaceMember',
    toObjectNameSingular: 'comment',
    fromFieldMetadataName: 'authoredComments',
    toFieldMetadataName: 'author',
  },
  {
    type: RelationMetadataType.ONE_TO_MANY,
    fromObjectNameSingular: 'workspaceMember',
    toObjectNameSingular: 'attachment',
    fromFieldMetadataName: 'authoredAttachments',
    toFieldMetadataName: 'author',
  },
];

export default workspaceMemberRelationMetadata;
