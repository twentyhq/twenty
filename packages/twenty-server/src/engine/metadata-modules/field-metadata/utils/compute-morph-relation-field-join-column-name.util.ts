import { capitalize } from 'twenty-shared/utils';

type ComputeMorphRelationFieldJoinColumnNameArgs = {
  name: string;
  targetObjectMetadataNameSingular: string;
};

export const computeMorphRelationFieldJoinColumnName = ({
  name,
  targetObjectMetadataNameSingular,
}: ComputeMorphRelationFieldJoinColumnNameArgs) => {
  return `${name}${capitalize(targetObjectMetadataNameSingular)}Id`;
};
