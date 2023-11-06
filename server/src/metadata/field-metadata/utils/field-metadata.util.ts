import { v4 } from 'uuid';

import { FieldMetadataTargetColumnMap } from 'src/metadata/field-metadata/interfaces/field-metadata-target-column-map.interface';

import { uuidToBase36 } from 'src/metadata/data-source/data-source.util';
import {
  FieldMetadata,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { TenantMigrationColumnAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

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
  type: FieldMetadataType,
): FieldMetadataTargetColumnMap {
  switch (type) {
    case FieldMetadataType.TEXT:
    case FieldMetadataType.PHONE:
    case FieldMetadataType.EMAIL:
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.BOOLEAN:
    case FieldMetadataType.DATE:
      return {
        value: `column_${uuidToBase36(v4())}`,
      };
    case FieldMetadataType.URL:
      return {
        text: `column_${uuidToBase36(v4())}`,
        link: `column_${uuidToBase36(v4())}`,
      };
    case FieldMetadataType.MONEY:
      return {
        amount: `column_${uuidToBase36(v4())}`,
        currency: `column_${uuidToBase36(v4())}`,
      };
    default:
      throw new Error(`Unknown type ${type}`);
  }
}

export function convertFieldMetadataToColumnActions(
  fieldMetadata: FieldMetadata,
): TenantMigrationColumnAction[] {
  switch (fieldMetadata.type) {
    case FieldMetadataType.TEXT:
      return [
        {
          name: fieldMetadata.targetColumnMap.value,
          action: 'create',
          type: 'text',
        },
      ];
    case FieldMetadataType.PHONE:
    case FieldMetadataType.EMAIL:
      return [
        {
          name: fieldMetadata.targetColumnMap.value,
          action: 'create',
          type: 'varchar',
        },
      ];
    case FieldMetadataType.NUMBER:
      return [
        {
          name: fieldMetadata.targetColumnMap.value,
          action: 'create',
          type: 'integer',
        },
      ];
    case FieldMetadataType.BOOLEAN:
      return [
        {
          name: fieldMetadata.targetColumnMap.value,
          action: 'create',
          type: 'boolean',
        },
      ];
    case FieldMetadataType.DATE:
      return [
        {
          name: fieldMetadata.targetColumnMap.value,
          action: 'create',
          type: 'timestamp',
        },
      ];
    case FieldMetadataType.URL:
      return [
        {
          name: fieldMetadata.targetColumnMap.text,
          action: 'create',
          type: 'varchar',
        },
        {
          name: fieldMetadata.targetColumnMap.link,
          action: 'create',
          type: 'varchar',
        },
      ];
    case FieldMetadataType.MONEY:
      return [
        {
          name: fieldMetadata.targetColumnMap.amount,
          action: 'create',
          type: 'integer',
        },
        {
          name: fieldMetadata.targetColumnMap.currency,
          action: 'create',
          type: 'varchar',
        },
      ];
    default:
      throw new Error(`Unknown type ${fieldMetadata.type}`);
  }
}
