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
    case FieldMetadataType.LINK: {
      const defaultValue =
        fieldMetadata.defaultValue as FieldMetadataDefaultValue<FieldMetadataType.LINK>;

      return [
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.label,
          columnType: 'varchar',
          defaultValue: serializeDefaultValue(defaultValue?.label),
        },
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.url,
          columnType: 'varchar',
          defaultValue: serializeDefaultValue(defaultValue?.url),
        },
      ];
    }
    case FieldMetadataType.CURRENCY: {
      const defaultValue =
        fieldMetadata.defaultValue as FieldMetadataDefaultValue<FieldMetadataType.CURRENCY>;

      return [
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.amountMicros,
          columnType: 'integer',
          defaultValue: serializeDefaultValue(defaultValue?.amountMicros),
        },
        {
          action: TenantMigrationColumnActionType.CREATE,
          columnName: fieldMetadata.targetColumnMap.currencyCode,
          columnType: 'varchar',
          defaultValue: serializeDefaultValue(defaultValue?.currencyCode),
        },
      ];
    }
    default:
      throw new Error(`Unknown type ${fieldMetadata.type}`);
  }
}
