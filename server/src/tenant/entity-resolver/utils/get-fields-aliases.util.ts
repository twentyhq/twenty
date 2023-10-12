import { FieldMetadata } from 'src/metadata/field-metadata/field-metadata.entity';

export const getFieldAliases = (fields: FieldMetadata[]) => {
  const fieldAliases = fields.reduce((acc, column) => {
    const values = Object.values(column.targetColumnMap);

    if (values.length === 1) {
      return {
        ...acc,
        // TODO: Handle plural for fields when we add relations
        [column.nameSingular]: values[0],
      };
    } else {
      return {
        ...acc,
        [values[0]]: values[0],
      };
    }
  }, {});

  return fieldAliases;
};
