import { buildStandardObjectSystemFields } from '@/metadata/utils/internal/build-standard-object-system-fields.util';

export const buildStandardObjectBaseFields = (
  objectUniversalIdentifier: string,
) => {
  const { id, createdAt, updatedAt, deletedAt } =
    buildStandardObjectSystemFields(objectUniversalIdentifier);
  return { id, createdAt, updatedAt, deletedAt };
};
