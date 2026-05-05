import { computeMorphRelationFieldName } from '@/utils/fieldMetadata/compute-morph-relation-field-name';

enum RelationType {
  MANY_TO_ONE = 'MANY_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
}

type ComputeRelationFieldJoinColumnNameArgs = {
  name: string;
};

export const computeRelationFieldJoinColumnName = ({
  name,
}: ComputeRelationFieldJoinColumnNameArgs): string => {
  return `${name}Id`;
};

type ComputeMorphRelationFieldJoinColumnNameArgs = {
  fieldName: string;
  relationType: RelationType;
  targetObjectMetadataNameSingular: string;
  targetObjectMetadataNamePlural: string;
};

export const computeMorphRelationFieldJoinColumnName = ({
  fieldName,
  relationType,
  targetObjectMetadataNameSingular,
  targetObjectMetadataNamePlural,
}: ComputeMorphRelationFieldJoinColumnNameArgs): string => {
  const morphFieldName = computeMorphRelationFieldName({
    fieldName,
    relationType,
    targetObjectMetadataNameSingular,
    targetObjectMetadataNamePlural,
  });

  return computeRelationFieldJoinColumnName({ name: morphFieldName });
};
