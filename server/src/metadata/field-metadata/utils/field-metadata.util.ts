import { v4 } from 'uuid';

import { FieldMetadataTargetColumnMap } from 'src/metadata/field-metadata/interfaces/field-metadata-target-column-map.interface';

import { uuidToBase36 } from 'src/metadata/data-source/data-source.util';
import {
  FieldMetadata,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import {
  TenantMigrationColumnAction,
  TenantMigrationColumnActionType,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

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
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.value,
          columnType: 'text',
        },
      ];
    case FieldMetadataType.PHONE:
    case FieldMetadataType.EMAIL:
      return [
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.value,
          columnType: 'varchar',
        },
      ];
    case FieldMetadataType.NUMBER:
      return [
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.value,
          columnType: 'integer',
        },
      ];
    case FieldMetadataType.BOOLEAN:
      return [
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.value,
          columnType: 'boolean',
        },
      ];
    case FieldMetadataType.DATE:
      return [
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.value,
          columnType: 'timestamp',
        },
      ];
    case FieldMetadataType.URL:
      return [
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.text,
          columnType: 'varchar',
        },
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.link,
          columnType: 'varchar',
        },
      ];
    case FieldMetadataType.MONEY:
      return [
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.amount,
          columnType: 'integer',
        },
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.currency,
          columnType: 'varchar',
        },
      ];
    default:
      throw new Error(`Unknown type ${fieldMetadata.type}`);
  }
}
