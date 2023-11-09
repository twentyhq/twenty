import { FieldMetadataTargetColumnMap } from 'src/tenant/schema-builder/interfaces/field-metadata-target-column-map.interface';

import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/database/typeorm/metadata/entities/field-metadata.entity';
import {
  TenantMigrationColumnAction,
  TenantMigrationColumnActionType,
} from 'src/database/typeorm/metadata/entities/tenant-migration.entity';

/**
 * Generate a target column map for a given type, this is used to map the field to the correct column(s) in the database.
 * This is used to support fields that map to multiple columns in the database.
 *
 * @param type string
 * @returns FieldMetadataTargetColumnMap
 */
export function generateTargetColumnMap(
  type: FieldMetadataType,
  isCustomField: boolean,
  fieldName: string,
): FieldMetadataTargetColumnMap {
  const columnName = isCustomField ? `_${fieldName}` : fieldName;

  switch (type) {
    case FieldMetadataType.TEXT:
    case FieldMetadataType.PHONE:
    case FieldMetadataType.EMAIL:
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.BOOLEAN:
    case FieldMetadataType.DATE:
      return {
        value: columnName,
      };
    case FieldMetadataType.URL:
      return {
        text: `${columnName}_text`,
        link: `${columnName}_link`,
      };
    case FieldMetadataType.MONEY:
      return {
        amount: `${columnName}_amount`,
        currency: `${columnName}_currency`,
      };
    default:
      throw new Error(`Unknown type ${type}`);
  }
}

export function convertFieldMetadataToColumnActions(
  fieldMetadata: FieldMetadataEntity,
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
