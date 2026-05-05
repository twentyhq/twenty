import { computeMorphRelationFieldName } from '@/utils/fieldMetadata/compute-morph-relation-field-name';

enum RelationType {
  MANY_TO_ONE = 'MANY_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
}

type ComputeRelationFieldJoinColumnNameArgs = {
  name: string;
};

// Returns the join column name for a (non-morph) relation field.
// Pass the field's `name` (e.g. `company`) and get back the join column
// (e.g. `companyId`).
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

// Returns the join column name for a morph relation field given a specific
// target object. Combines the morph field name (which depends on the target
// object name) with the `Id` suffix.
// e.g. fieldName=`target`, target=`opportunity` (MANY_TO_ONE) → `targetOpportunityId`.
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
