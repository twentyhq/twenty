import { FieldMetadataDefaultValue } from 'src/metadata/field-metadata/interfaces/field-metadata-default-value.interface';

import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import {
  TenantMigrationColumnAction,
  TenantMigrationColumnActionType,
} from 'src/metadata/tenant-migration/tenant-migration.entity';
import { serializeDefaultValue } from 'src/metadata/field-metadata/utils/serialize-default-value';

export function convertFieldMetadataToColumnActions(
  fieldMetadata: FieldMetadataEntity,
): TenantMigrationColumnAction[] {
  switch (fieldMetadata.type) {
    case FieldMetadataType.TEXT: {
      const defaultValue =
        fieldMetadata.defaultValue as FieldMetadataDefaultValue<FieldMetadataType.TEXT>;

      return [
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.value,
          columnType: 'text',
          defaultValue: serializeDefaultValue(defaultValue?.value),
        },
      ];
    }
    case FieldMetadataType.PHONE:
    case FieldMetadataType.EMAIL: {
      const defaultValue =
        fieldMetadata.defaultValue as FieldMetadataDefaultValue<
          FieldMetadataType.PHONE | FieldMetadataType.EMAIL
        >;

      return [
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.value,
          columnType: 'varchar',
          defaultValue: serializeDefaultValue(defaultValue?.value),
        },
      ];
    }
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.PROBABILITY: {
      const defaultValue =
        fieldMetadata.defaultValue as FieldMetadataDefaultValue<
          FieldMetadataType.NUMBER | FieldMetadataType.PROBABILITY
        >;

      return [
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.value,
          columnType: 'float',
          defaultValue: serializeDefaultValue(defaultValue?.value),
        },
      ];
    }
    case FieldMetadataType.BOOLEAN: {
      const defaultValue =
        fieldMetadata.defaultValue as FieldMetadataDefaultValue<FieldMetadataType.BOOLEAN>;

      return [
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.value,
          columnType: 'boolean',
          defaultValue: serializeDefaultValue(defaultValue?.value),
        },
      ];
    }
    case FieldMetadataType.DATE: {
      const defaultValue =
        fieldMetadata.defaultValue as FieldMetadataDefaultValue<FieldMetadataType.DATE>;

      return [
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.value,
          columnType: 'timestamp',
          defaultValue: serializeDefaultValue(defaultValue?.value),
        },
      ];
    }
    case FieldMetadataType.URL: {
      const defaultValue =
        fieldMetadata.defaultValue as FieldMetadataDefaultValue<FieldMetadataType.URL>;

      return [
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.text,
          columnType: 'varchar',
          defaultValue: serializeDefaultValue(defaultValue?.text),
        },
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.link,
          columnType: 'varchar',
          defaultValue: serializeDefaultValue(defaultValue?.link),
        },
      ];
    }
    case FieldMetadataType.MONEY: {
      const defaultValue =
        fieldMetadata.defaultValue as FieldMetadataDefaultValue<FieldMetadataType.MONEY>;

      return [
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.amount,
          columnType: 'integer',
          defaultValue: serializeDefaultValue(defaultValue?.amount),
        },
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.currency,
          columnType: 'varchar',
          defaultValue: serializeDefaultValue(defaultValue?.currency),
        },
      ];
    }
    default:
      throw new Error(`Unknown type ${fieldMetadata.type}`);
  }
}
