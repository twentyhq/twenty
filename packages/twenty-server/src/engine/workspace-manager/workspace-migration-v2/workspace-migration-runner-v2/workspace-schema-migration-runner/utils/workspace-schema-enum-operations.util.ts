import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { getCompositeTypeOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-type-or-throw.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';
import { type WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration-runner/utils/compute-postgres-enum-name.util';
import {
  WorkspaceSchemaMigrationException,
  WorkspaceSchemaMigrationExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/exceptions/workspace-schema-migration.exception';

export interface EnumOperationSpec {
  enumName: string;
  values?: string[];
  fromName?: string;
  toName?: string;
}

export const collectEnumOperationsForField = ({
  fieldMetadata,
  tableName,
  operation,
  options,
}: {
  fieldMetadata: FlatFieldMetadata;
  tableName: string;
  operation: 'create' | 'drop' | 'rename';
  options?: { newFieldName?: string };
}): EnumOperationSpec[] => {
  const enumOperations: EnumOperationSpec[] = [];

  if (isCompositeFieldMetadataType(fieldMetadata.type)) {
    const compositeType = getCompositeTypeOrThrow(fieldMetadata.type);

    for (const property of compositeType.properties) {
      if (
        property.type === FieldMetadataType.RELATION ||
        !isEnumFieldMetadataType(property.type)
      ) {
        continue;
      }

      const columnName = computeCompositeColumnName(
        fieldMetadata.name,
        property,
      );
      const enumName = computePostgresEnumName({ tableName, columnName });

      if (operation === 'create') {
        enumOperations.push({
          enumName,
          values: property.options?.map((option) => option.value) ?? [],
        });
      } else if (operation === 'drop') {
        enumOperations.push({ enumName });
      } else if (operation === 'rename' && options?.newFieldName) {
        const newColumnName = computeCompositeColumnName(
          options.newFieldName,
          property,
        );
        const newEnumName = computePostgresEnumName({
          tableName,
          columnName: newColumnName,
        });

        enumOperations.push({
          enumName,
          fromName: enumName,
          toName: newEnumName,
        });
      }
    }
  } else if (isEnumFieldMetadataType(fieldMetadata.type)) {
    if (operation === 'create') {
      const enumName = computePostgresEnumName({
        tableName,
        columnName: fieldMetadata.name,
      });

      enumOperations.push({
        enumName,
        values: fieldMetadata.options?.map((option) => option.value) ?? [],
      });
    } else if (operation === 'drop') {
      const enumName = computePostgresEnumName({
        tableName,
        columnName: fieldMetadata.name,
      });

      enumOperations.push({ enumName });
    } else if (operation === 'rename' && options?.newFieldName) {
      const enumName = computePostgresEnumName({
        tableName,
        columnName: fieldMetadata.name,
      });
      const newEnumName = computePostgresEnumName({
        tableName,
        columnName: options.newFieldName,
      });

      enumOperations.push({
        enumName,
        fromName: enumName,
        toName: newEnumName,
      });
    }
  }

  return enumOperations;
};

export const collectEnumOperationsForObject = ({
  objectMetadata,
  tableName,
  operation,
  options,
}: {
  objectMetadata: FlatObjectMetadataWithFlatFieldMaps;
  tableName: string;
  operation: 'drop' | 'rename';
  options?: { newTableName?: string };
}): EnumOperationSpec[] => {
  const enumOperations: EnumOperationSpec[] = [];

  if (!objectMetadata.fieldsById) {
    return enumOperations;
  }

  const enumFields = Object.values(objectMetadata.fieldsById)
    .filter(isDefined)
    .filter((field) => isEnumFieldMetadataType(field.type));

  for (const enumField of enumFields) {
    const field = enumField;

    if (operation === 'drop') {
      const enumName = computePostgresEnumName({
        tableName,
        columnName: field.name,
      });

      enumOperations.push({ enumName });
    } else if (operation === 'rename' && options?.newTableName) {
      const fromEnumName = computePostgresEnumName({
        tableName,
        columnName: field.name,
      });
      const toEnumName = computePostgresEnumName({
        tableName: options.newTableName,
        columnName: field.name,
      });

      enumOperations.push({
        enumName: fromEnumName,
        fromName: fromEnumName,
        toName: toEnumName,
      });
    }
  }

  return enumOperations;
};

export const executeBatchEnumOperations = async ({
  operation,
  enumOperations,
  queryRunner,
  schemaName,
  workspaceSchemaManagerService,
}: {
  operation: 'create' | 'drop' | 'rename';
  enumOperations: EnumOperationSpec[];
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceSchemaManagerService: WorkspaceSchemaManagerService;
}): Promise<void> => {
  if (enumOperations.length === 0) {
    return;
  }

  try {
    const enumPromises = enumOperations.map((enumOp) => {
      switch (operation) {
        case 'create':
          return workspaceSchemaManagerService.enumManager.createEnum(
            queryRunner,
            schemaName,
            enumOp.enumName,
            enumOp.values ?? [],
          );
        case 'drop':
          return workspaceSchemaManagerService.enumManager.dropEnum(
            queryRunner,
            schemaName,
            enumOp.enumName,
          );
        case 'rename':
          return workspaceSchemaManagerService.enumManager.renameEnum(
            queryRunner,
            schemaName,
            enumOp.fromName!,
            enumOp.toName!,
          );
        default:
          throw new Error(`Unsupported enum operation: ${operation}`);
      }
    });

    await Promise.all(enumPromises);
  } catch {
    throw new WorkspaceSchemaMigrationException(
      `Failed to execute batch ${operation} enum operations`,
      WorkspaceSchemaMigrationExceptionCode.ENUM_OPERATION_FAILED,
    );
  }
};
