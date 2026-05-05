import { computeRelationFieldJoinColumnName } from 'twenty-shared/utils';

type ComputeRelationFieldJoinColumnNameArgs = {
  name: string;
};

// Thin wrapper around the shared util kept for backward compatibility.
// Prefer importing `computeRelationFieldJoinColumnName` directly from
// `twenty-shared/utils` in new code.
export const computeMorphOrRelationFieldJoinColumnName = ({
  name,
}: ComputeRelationFieldJoinColumnNameArgs) => {
  return computeRelationFieldJoinColumnName({ name });
};
