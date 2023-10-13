import { v4 } from 'uuid';

import { uuidToBase36 } from 'src/metadata/data-source/data-source.util';
import {
  FieldMetadata,
  FieldMetadataTargetColumnMap,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { TenantMigrationColumnChange } from 'src/metadata/tenant-migration/tenant-migration.entity';

/**
 * Generate a column name from a field name removing unsupported characters.
 *
 * @param name string
 * @returns string
 */
export function generateColumnName(name: string): string {
  return name.toLowerCase().replace(/ /g, '_');
}

/**
 * Generate a target column map for a given type, this is used to map the field to the correct column(s) in the database.
 * This is used to support fields that map to multiple columns in the database.
 *
 * @param type string
 * @returns FieldMetadataTargetColumnMap
 */
export function generateTargetColumnMap(
  type: string,
): FieldMetadataTargetColumnMap {
  switch (type) {
    case 'text':
    case 'phone':
    case 'email':
    case 'number':
    case 'boolean':
    case 'date':
      return {
        value: `column_${uuidToBase36(v4())}`,
      };
    case 'url':
      return {
        text: `column_${uuidToBase36(v4())}`,
        link: `column_${uuidToBase36(v4())}`,
      };
    case 'money':
      return {
        amount: `column_${uuidToBase36(v4())}`,
        currency: `column_${uuidToBase36(v4())}`,
      };
    default:
      throw new Error(`Unknown type ${type}`);
  }
}

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

// Deprecated with target_column_name deprecation
export function convertMetadataTypeToColumnType(type: string) {
  switch (type) {
    case 'text':
    case 'url':
    case 'phone':
    case 'email':
      return 'text';
    case 'number':
      return 'int';
    case 'boolean':
      return 'boolean';
    case 'date':
      return 'timestamp';
    case 'money':
      return 'integer';
    default:
      throw new Error('Invalid type');
  }
}
