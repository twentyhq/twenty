import { TenantMigrationColumnChange } from 'src/metadata/tenant-migration/tenant-migration.entity';

import { FieldMetadata } from './field-metadata/field-metadata.entity';

export function convertFieldMetadataToColumnChanges(
  fieldMetadata: FieldMetadata,
): TenantMigrationColumnChange[] {
  switch (fieldMetadata.type) {
    case 'text':
      return [
        {
          name: fieldMetadata.targetColumnMap.value,
          change: 'create',
          type: 'text',
        },
      ];
    case 'phone':
    case 'email':
      return [
        {
          name: fieldMetadata.targetColumnMap.value,
          change: 'create',
          type: 'varchar',
        },
      ];
    case 'number':
      return [
        {
          name: fieldMetadata.targetColumnMap.value,
          change: 'create',
          type: 'integer',
        },
      ];
    case 'boolean':
      return [
        {
          name: fieldMetadata.targetColumnMap.value,
          change: 'create',
          type: 'boolean',
        },
      ];
    case 'date':
      return [
        {
          name: fieldMetadata.targetColumnMap.value,
          change: 'create',
          type: 'timestamp',
        },
      ];
    case 'url':
      return [
        {
          name: fieldMetadata.targetColumnMap.text,
          change: 'create',
          type: 'varchar',
        },
        {
          name: fieldMetadata.targetColumnMap.link,
          change: 'create',
          type: 'varchar',
        },
      ];
    case 'money':
      return [
        {
          name: fieldMetadata.targetColumnMap.amount,
          change: 'create',
          type: 'integer',
        },
        {
          name: fieldMetadata.targetColumnMap.currency,
          change: 'create',
          type: 'varchar',
        },
      ];
    default:
      throw new Error(`Unknown type ${fieldMetadata.type}`);
  }
}
