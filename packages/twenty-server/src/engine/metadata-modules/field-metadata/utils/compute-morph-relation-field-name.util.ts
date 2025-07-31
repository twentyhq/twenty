import { capitalize } from 'twenty-shared/utils';

type ComputeMorphRelationFieldNameArgs = {
  name: string;
  targetObjectMetadataNameSingular: string;
};

export const computeMorphRelationFieldName = ({
  name,
  targetObjectMetadataNameSingular,
}: ComputeMorphRelationFieldNameArgs) => {
  return `${name}${capitalize(targetObjectMetadataNameSingular)}`;
};
