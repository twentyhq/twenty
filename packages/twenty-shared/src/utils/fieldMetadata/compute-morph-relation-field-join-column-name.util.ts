import { capitalize } from '@/utils/strings';

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
