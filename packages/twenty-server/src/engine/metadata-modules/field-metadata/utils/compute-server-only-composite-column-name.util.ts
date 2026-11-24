// A field name is alphanumeric, so the underscore keeps this column apart from the columns of every field.
export const computeServerOnlyCompositeColumnName = ({
  fieldName,
  columnName,
}: {
  fieldName: string;
  columnName: string;
}): string => `${fieldName}_${columnName}`;
