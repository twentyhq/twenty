import { Injectable } from '@nestjs/common';

import { FieldMetadataType, type FromTo } from 'twenty-shared/types';
import { type QueryRunner } from 'typeorm';

import { type FieldMetadataDefaultValueForAnyType } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import {
  type FieldMetadataComplexOption,
  type FieldMetadataDefaultOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { getCompositeTypeOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-type-or-throw.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { isEnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-enum-field-metadata-type.util';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataFromMapOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/get-flat-object-metadata-from-map-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import {
  type CreateFieldAction,
  type DeleteFieldAction,
  type UpdateFieldAction,
  type WorkspaceMigrationFieldActionTypeV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import { type RunnerMethodForActionType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/runner-method-for-action-type';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import {
  WorkspaceSchemaMigrationException,
  WorkspaceSchemaMigrationExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/exceptions/workspace-schema-migration.exception';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/utils/generate-column-definitions.util';

import {
  prepareFieldWorkspaceSchemaContext,
  prepareWorkspaceSchemaContext,
} from './utils/workspace-schema-context.util';
import {
  collectEnumOperationsForField,
  executeBatchEnumOperations,
} from './utils/workspace-schema-enum-operations.util';

@Injectable()
export class WorkspaceSchemaFieldActionRunnerService
  implements
    RunnerMethodForActionType<WorkspaceMigrationFieldActionTypeV2, 'schema'>
{
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {}

  runDeleteFieldSchemaMigration = async ({
    action,
    queryRunner,
    flatObjectMetadataMaps,
  }: WorkspaceMigrationActionRunnerArgs<DeleteFieldAction>) => {
    const { objectMetadataId, fieldMetadataId } = action;
    const { schemaName, tableName, fieldMetadata } =
      prepareFieldWorkspaceSchemaContext({
        flatObjectMetadataMaps,
        objectMetadataId,
        fieldMetadataId,
      });

    const flatObjectMetadata = getFlatObjectMetadataFromMapOrThrow(
      flatObjectMetadataMaps,
      objectMetadataId,
    );

    const columnDefinitions = generateColumnDefinitions({
      fieldMetadata,
      objectMetadataWithOrWithoutFields: flatObjectMetadata,
    });
    const columnNamesToDrop = columnDefinitions.map((def) => def.name);

    await this.workspaceSchemaManagerService.columnManager.dropColumns(
      queryRunner,
      schemaName,
      tableName,
      columnNamesToDrop,
    );

    const enumOperations = collectEnumOperationsForField({
      fieldMetadata,
      tableName,
      operation: 'drop',
    });

    await executeBatchEnumOperations({
      operation: 'drop',
      enumOperations,
      queryRunner,
      schemaName,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
    });

    return;
  };

  runCreateFieldSchemaMigration = async ({
    action,
    queryRunner,
    flatObjectMetadataMaps,
  }: WorkspaceMigrationActionRunnerArgs<CreateFieldAction>) => {
    const { flatFieldMetadata } = action;
    const { schemaName, tableName, flatObjectMetadata } =
      prepareWorkspaceSchemaContext({
        flatObjectMetadataMaps,
        objectMetadataId: flatFieldMetadata.objectMetadataId,
      });

    const enumOperations = collectEnumOperationsForField({
      fieldMetadata: flatFieldMetadata,
      tableName,
      operation: 'create',
    });

    await executeBatchEnumOperations({
      operation: 'create',
      enumOperations,
      queryRunner,
      schemaName,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
    });

    const columnDefinitions = generateColumnDefinitions({
      fieldMetadata: flatFieldMetadata,
      objectMetadataWithOrWithoutFields: flatObjectMetadata,
    });

    await this.workspaceSchemaManagerService.columnManager.addColumns(
      queryRunner,
      schemaName,
      tableName,
      columnDefinitions,
    );

    return;
  };

  runUpdateFieldSchemaMigration = async ({
    action,
    queryRunner,
    flatObjectMetadataMaps,
  }: WorkspaceMigrationActionRunnerArgs<UpdateFieldAction>) => {
    const { objectMetadataId, fieldMetadataId, updates } = action;
    const {
      schemaName,
      tableName,
      flatObjectMetadata,
      fieldMetadata: currentFlatFieldMetadata,
    } = prepareFieldWorkspaceSchemaContext({
      flatObjectMetadataMaps,
      objectMetadataId,
      fieldMetadataId,
    });

    let optimisticFlatFieldMetadata = structuredClone(currentFlatFieldMetadata);

    for (const update of updates) {
      if (update.property === 'name') {
        await this.handleFieldNameUpdate(
          queryRunner,
          schemaName,
          tableName,
          optimisticFlatFieldMetadata,
          update,
        );
        optimisticFlatFieldMetadata.name = update.to;
      }
      if (update.property === 'defaultValue') {
        await this.handleFieldDefaultValueUpdate(
          queryRunner,
          schemaName,
          tableName,
          optimisticFlatFieldMetadata,
          update,
        );
        optimisticFlatFieldMetadata.defaultValue = update.to;
      }
      if (
        update.property === 'options' &&
        isEnumFieldMetadataType(optimisticFlatFieldMetadata.type)
      ) {
        await this.handleFieldOptionsUpdate(
          queryRunner,
          schemaName,
          tableName,
          flatObjectMetadata,
          optimisticFlatFieldMetadata,
          update,
        );
        optimisticFlatFieldMetadata.options = update.to ?? [];
      }
    }

    return;
  };

  private async handleFieldNameUpdate(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    fieldMetadata: FlatFieldMetadata,
    update: {
      property: 'name';
    } & FromTo<string>,
  ) {
    if (isCompositeFieldMetadataType(fieldMetadata.type)) {
      const compositeType = getCompositeTypeOrThrow(fieldMetadata.type);

      for (const property of compositeType.properties) {
        if (property.type === FieldMetadataType.RELATION) {
          continue;
        }

        const fromCompositeColumnName = computeCompositeColumnName(
          update.from,
          property,
        );
        const toCompositeColumnName = computeCompositeColumnName(
          update.to,
          property,
        );

        await this.workspaceSchemaManagerService.columnManager.renameColumn(
          queryRunner,
          schemaName,
          tableName,
          fromCompositeColumnName,
          toCompositeColumnName,
        );
      }
    } else {
      await this.workspaceSchemaManagerService.columnManager.renameColumn(
        queryRunner,
        schemaName,
        tableName,
        update.from,
        update.to,
      );
    }

    const enumOperations = collectEnumOperationsForField({
      fieldMetadata,
      tableName,
      operation: 'rename',
      options: {
        newFieldName: update.to,
      },
    });

    await executeBatchEnumOperations({
      operation: 'rename',
      enumOperations,
      queryRunner,
      schemaName,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
    });
  }

  private async handleFieldDefaultValueUpdate(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    fieldMetadata: FlatFieldMetadata,
    update: {
      property: 'defaultValue';
    } & FromTo<FieldMetadataDefaultValueForAnyType>,
  ) {
    if (isCompositeFieldMetadataType(fieldMetadata.type)) {
      const compositeType = getCompositeTypeOrThrow(fieldMetadata.type);

      for (const property of compositeType.properties) {
        if (property.type === FieldMetadataType.RELATION) {
          continue;
        }

        const compositeColumnName = computeCompositeColumnName(
          fieldMetadata.name,
          property,
        );
        // @ts-expect-error - TODO: fix this
        let compositeDefaultValue = update.to?.[property.name];

        // Ensure string defaults for composite properties are properly quoted
        if (
          typeof compositeDefaultValue === 'string' &&
          !compositeDefaultValue.startsWith("'")
        ) {
          compositeDefaultValue = `'${compositeDefaultValue}'`;
        }

        const serializedNewDefaultValue = serializeDefaultValue(
          compositeDefaultValue,
        );

        await this.workspaceSchemaManagerService.columnManager.alterColumnDefault(
          queryRunner,
          schemaName,
          tableName,
          compositeColumnName,
          serializedNewDefaultValue,
        );
      }
    } else {
      const serializedNewDefaultValue = serializeDefaultValue(update.to);

      await this.workspaceSchemaManagerService.columnManager.alterColumnDefault(
        queryRunner,
        schemaName,
        tableName,
        fieldMetadata.name,
        serializedNewDefaultValue,
      );
    }
  }

  private async handleFieldOptionsUpdate(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    flatObjectMetadata: FlatObjectMetadata,
    fieldMetadata: FlatFieldMetadata,
    update: {
      property: 'options';
    } & FromTo<
      FieldMetadataDefaultOption[] | FieldMetadataComplexOption[] | null
    >,
  ) {
    const fromOptionsById = new Map(
      (update.from ?? [])
        .filter(
          (opt: FieldMetadataDefaultOption | FieldMetadataComplexOption) =>
            Boolean(opt.id),
        )
        .map((opt: FieldMetadataDefaultOption | FieldMetadataComplexOption) => [
          opt.id,
          opt,
        ]),
    );

    const valueMapping: Record<string, string> = {};

    for (const toOption of fieldMetadata.options ?? []) {
      if (!toOption.id) {
        continue;
      }

      const fromOption = fromOptionsById.get(toOption.id);

      if (
        fromOption &&
        (fromOption as FieldMetadataDefaultOption | FieldMetadataComplexOption)
          .value !==
          (toOption as FieldMetadataDefaultOption | FieldMetadataComplexOption)
            .value
      ) {
        valueMapping[
          (
            fromOption as
              | FieldMetadataDefaultOption
              | FieldMetadataComplexOption
          ).value
        ] = (
          toOption as FieldMetadataDefaultOption | FieldMetadataComplexOption
        ).value;
      }
    }

    const optimisticColumnDefinitions = generateColumnDefinitions({
      fieldMetadata,
      objectMetadataWithOrWithoutFields: flatObjectMetadata,
    });

    const enumColumnDefinition =
      optimisticColumnDefinitions.length > 0
        ? optimisticColumnDefinitions[0]
        : undefined;

    if (!enumColumnDefinition) {
      throw new WorkspaceSchemaMigrationException(
        'No column definition found for enum field',
        WorkspaceSchemaMigrationExceptionCode.ENUM_OPERATION_FAILED,
      );
    }

    await this.workspaceSchemaManagerService.enumManager.alterEnumValues(
      queryRunner,
      schemaName,
      tableName,
      enumColumnDefinition,
      valueMapping,
    );
  }
}
