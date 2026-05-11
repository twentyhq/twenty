type ComputeMorphOrRelationFieldJoinColumnNameArgs = {
  name: string;
};

export const computeMorphOrRelationFieldJoinColumnName = ({
  name,
}: ComputeMorphOrRelationFieldJoinColumnNameArgs): string => {
  return `${name}Id`;
};
