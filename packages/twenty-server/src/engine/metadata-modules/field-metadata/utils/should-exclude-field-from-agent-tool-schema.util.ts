import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const shouldExcludeFieldFromAgentToolSchema = (
  field: FieldMetadataEntity,
  excludeId = true,
): boolean => {
  const excludedFieldNames = [
    'createdAt',
    'updatedAt',
    'deletedAt',
    'searchVector',
    'createdBy',
  ];

  if (excludeId) {
    excludedFieldNames.push('id');
  }

  return excludedFieldNames.includes(field.name) || field.isSystem;
};
