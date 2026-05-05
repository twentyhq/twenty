import { computeMorphRelationFieldName } from '@/utils/fieldMetadata/compute-morph-relation-field-name';

enum RelationType {
  MANY_TO_ONE = 'MANY_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
}

type ComputeRelationGqlFieldJoinColumnNameArgs = {
  name: string;
};

export const computeRelationGqlFieldJoinColumnName = ({
  name,
}: ComputeRelationGqlFieldJoinColumnNameArgs): string => {
  return `${name}Id`;
};

type ComputeMorphRelationGqlFieldJoinColumnNameArgs = {
  fieldName: string;
  relationType: RelationType;
  targetObjectMetadataNameSingular: string;
  targetObjectMetadataNamePlural: string;
};

export const computeMorphRelationGqlFieldJoinColumnName = ({
  fieldName,
  relationType,
  targetObjectMetadataNameSingular,
  targetObjectMetadataNamePlural,
}: ComputeMorphRelationGqlFieldJoinColumnNameArgs): string => {
  const morphFieldName = computeMorphRelationFieldName({
    fieldName,
    relationType,
    targetObjectMetadataNameSingular,
    targetObjectMetadataNamePlural,
  });

  return computeRelationGqlFieldJoinColumnName({ name: morphFieldName });
};
