import { capitalize } from 'twenty-shared';

export const buildDescriptionForRelationFieldMetadataOnToField = ({
  relationObjectMetadataNamePlural,
  targetObjectLabelSingular,
}: {
  relationObjectMetadataNamePlural: string;
  targetObjectLabelSingular: string;
}) => {
  const description = `${capitalize(relationObjectMetadataNamePlural)} ${targetObjectLabelSingular}`;

  return { description };
};
