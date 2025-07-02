import { isDefined } from 'twenty-shared/utils';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export const getUniqueConstraintsFields = (
  objectMetadata: ObjectMetadataInterface,
): FieldMetadataInterface[][] => {
  const uniqueIndexes = objectMetadata.indexMetadatas.filter(
    (index) => index.isUnique,
  );

  const fieldsMapById = new Map(
    objectMetadata.fields.map((field) => [field.id, field]),
  );

  const primaryKeyConstraintField = objectMetadata.fields.find(
    (field) => field.name === 'id',
  );

  if (!isDefined(primaryKeyConstraintField)) {
    throw new Error(
      `Primary key constraint field not found for object metadata ${objectMetadata.id}`,
    );
  }

  const otherUniqueConstraintsFields = uniqueIndexes.map((index) =>
    index.indexFieldMetadatas.map((field) => {
      const indexField = fieldsMapById.get(field.fieldMetadataId);

      if (!isDefined(indexField)) {
        throw new Error(
          `Index field not found for field id ${field.fieldMetadataId} in index metadata ${index.id}`,
        );
      }

      return indexField;
    }),
  );

  return [[primaryKeyConstraintField], ...otherUniqueConstraintsFields];
};
