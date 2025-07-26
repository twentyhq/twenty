import { isDefined } from '@/utils/validation/isDefined';

export const getUniqueConstraintsFields = <
  K extends {
    id: string;
    name: string;
  },
  T extends {
    id: string;
    indexMetadatas: {
      id: string;
      isUnique: boolean;
      indexFieldMetadatas: { fieldMetadataId: string }[];
    }[];
    fields: K[];
  },
>(
  objectMetadata: T,
): K[][] => {
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
