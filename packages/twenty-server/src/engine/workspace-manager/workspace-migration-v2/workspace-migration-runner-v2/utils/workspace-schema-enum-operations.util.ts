import { type FieldMetadataType } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { getCompositeTypeOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-type-or-throw.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { type WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration-runner/utils/compute-postgres-enum-name.util';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/exceptions/workspace-migration-runner.exception';

export interface CreateEnumOperationSpec {
  operation: EnumOperation.CREATE;
  enumName: string;
  values: string[];
}

export interface DropEnumOperationSpec {
  operation: EnumOperation.DROP;
  enumName: string;
}

export interface RenameEnumOperationSpec {
  operation: EnumOperation.RENAME;
  fromName: string;
  toName: string;
}

export type EnumOperationSpec =
  | CreateEnumOperationSpec
  | DropEnumOperationSpec
  | RenameEnumOperationSpec;

export enum EnumOperation {
  CREATE = 'create',
  DROP = 'drop',
  RENAME = 'rename',
}

const collectEnumOperationsForBasicEnumField = ({
  flatFieldMetadata,
  tableName,
  operation,
  options,
}: {
  flatFieldMetadata: FlatFieldMetadata<
    | FieldMetadataType.SELECT
    | FieldMetadataType.MULTI_SELECT
    | FieldMetadataType.RATING
  >;
  tableName: string;
  operation: EnumOperation;
  options?: { newTableName?: string; newFieldName?: string };
}): EnumOperationSpec[] => {
  const enumName = computePostgresEnumName({
    tableName,
    columnName: flatFieldMetadata.name,
  });

  switch (operation) {
    case EnumOperation.CREATE:
      return [
        {
          operation: EnumOperation.CREATE,
          enumName,
          values:
            flatFieldMetadata.options?.map((option) => option.value) ?? [],
        },
      ];
    case EnumOperation.DROP:
      return [{ operation: EnumOperation.DROP, enumName }];
    case EnumOperation.RENAME: {
      const newEnumName = computePostgresEnumName({
        tableName: options?.newTableName ?? tableName,
        columnName: options?.newFieldName ?? flatFieldMetadata.name,
      });

      return [
        {
          operation: EnumOperation.RENAME,
          fromName: enumName,
          toName: newEnumName,
        },
      ];
    }
    default:
      return assertUnreachable(operation, 'Unsupported enum operation');
  }
};

const collectEnumOperationsForCompositeField = ({
  flatFieldMetadata,
  tableName,
  operation,
  options,
}: {
  flatFieldMetadata: FlatFieldMetadata<CompositeFieldMetadataType>;
  tableName: string;
  operation: EnumOperation;
  options?: { newTableName?: string; newFieldName?: string };
}): EnumOperationSpec[] => {
  const compositeType = getCompositeTypeOrThrow(flatFieldMetadata.type);

  return compositeType.properties
    .filter((property) => isEnumFieldMetadataType(property.type))
    .map((property) => {
      const columnName = computeCompositeColumnName(
        flatFieldMetadata.name,
        property,
      );
      const enumName = computePostgresEnumName({ tableName, columnName });

      switch (operation) {
        case EnumOperation.CREATE:
          return {
            operation: EnumOperation.CREATE,
            enumName,
            values: property.options?.map((option) => option.value) ?? [],
          };
        case EnumOperation.DROP:
          return { operation: EnumOperation.DROP, enumName };
        case EnumOperation.RENAME: {
          const newOrExistingTableName = options?.newTableName ?? tableName;
          const newOrExistingColumnName = computeCompositeColumnName(
            options?.newFieldName ?? flatFieldMetadata.name,
            property,
          );
          const newEnumName = computePostgresEnumName({
            tableName: newOrExistingTableName,
            columnName: newOrExistingColumnName,
          });

          return {
            operation: EnumOperation.RENAME,
            fromName: enumName,
            toName: newEnumName,
          };
        }
        default:
          return assertUnreachable(operation, 'Unsupported enum operation');
      }
    });
};

export const collectEnumOperationsForField = ({
  flatFieldMetadata,
  tableName,
  operation,
  options,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  tableName: string;
  operation: EnumOperation;
  options?: { newTableName?: string; newFieldName?: string };
}): EnumOperationSpec[] => {
  if (isCompositeFlatFieldMetadata(flatFieldMetadata)) {
    return collectEnumOperationsForCompositeField({
      flatFieldMetadata,
      tableName,
      operation,
      options,
    });
  }
  if (isEnumFlatFieldMetadata(flatFieldMetadata)) {
    return collectEnumOperationsForBasicEnumField({
      flatFieldMetadata,
      tableName,
      operation,
      options,
    });
  }

  return [];
};

export const collectEnumOperationsForObject = ({
  tableName,
  operation,
  flatFieldMetadatas,
  options,
}: {
  tableName: string;
  operation: EnumOperation;
  flatFieldMetadatas: FlatFieldMetadata[];
  options?: { newTableName?: string; newFieldName?: string };
}): EnumOperationSpec[] => {
  return flatFieldMetadatas.flatMap((flatFieldMetadata) =>
    collectEnumOperationsForField({
      flatFieldMetadata,
      tableName,
      operation,
      options,
    }),
  );
};

export const executeBatchEnumOperations = async ({
  enumOperations,
  queryRunner,
  schemaName,
  workspaceSchemaManagerService,
}: {
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
      switch (enumOp.operation) {
        case EnumOperation.CREATE:
          return workspaceSchemaManagerService.enumManager.createEnum({
            queryRunner,
            schemaName,
            enumName: enumOp.enumName,
            values: enumOp.values,
          });
        case EnumOperation.DROP:
          return workspaceSchemaManagerService.enumManager.dropEnum({
            queryRunner,
            schemaName,
            enumName: enumOp.enumName,
          });
        case EnumOperation.RENAME:
          return workspaceSchemaManagerService.enumManager.renameEnum({
            queryRunner,
            schemaName,
            oldEnumName: enumOp.fromName,
            newEnumName: enumOp.toName,
          });
        default:
          return assertUnreachable(enumOp, 'Unsupported enum operation');
      }
    });

    await Promise.all(enumPromises);
  } catch (error) {
    throw new WorkspaceMigrationRunnerException(
      `Failed to execute batch enum operations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      WorkspaceMigrationRunnerExceptionCode.ENUM_OPERATION_FAILED,
    );
  }
};
