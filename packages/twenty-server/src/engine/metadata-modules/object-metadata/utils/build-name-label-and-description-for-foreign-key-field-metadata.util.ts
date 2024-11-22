export const buildNameLabelAndDescriptionForForeignKeyFieldMetadata = ({
  targetObjectNameSingular,
  targetObjectLabelSingular,
  relatedObjectLabelSingular,
}: {
  targetObjectNameSingular: string;
  targetObjectLabelSingular: string;
  relatedObjectLabelSingular: string;
}) => {
  const name = `${targetObjectNameSingular}Id`;
  const label = `${targetObjectLabelSingular} ID (foreign key)`;
  const description = `${relatedObjectLabelSingular} ${targetObjectLabelSingular} id foreign key`;

  return { name, label, description };
};
