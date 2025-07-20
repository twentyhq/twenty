type ComputeRelationFieldJoinColumnNameArgs = {
  name: string;
};

export const computeRelationFieldJoinColumnName = ({
  name,
}: ComputeRelationFieldJoinColumnNameArgs) => {
  return `${name}Id`;
};
