import { Injectable } from '@nestjs/common';

import { FieldMetadataType, type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { type FieldMetadataDefaultValueForAnyType } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';

import {
  FieldMetadataDefaultOption,
  type FieldMetadataComplexOption,
} from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { EnumFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/enum-field-metadata-type.type';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { getCompositeTypeOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-type-or-throw.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { unserializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/unserialize-default-value';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps-or-throw.util';
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
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/utils/generate-column-definitions.util';

import {
  prepareFieldWorkspaceSchemaContext,
  prepareWorkspaceSchemaContext,
} from './utils/workspace-schema-context.util';
import {
  collectEnumOperationsForField,
  EnumOperation,
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

    const flatObjectMetadata =
      findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps,
        objectMetadataId,
      });

    const columnDefinitions = generateColumnDefinitions({
      flatFieldMetadata: fieldMetadata,
      flatObjectMetadataWithoutFields: flatObjectMetadata,
    });
    const columnNamesToDrop = columnDefinitions.map((def) => def.name);

    await this.workspaceSchemaManagerService.columnManager.dropColumns({
      queryRunner,
      schemaName,
      tableName,
      columnNames: columnNamesToDrop,
    });

    const enumOperations = collectEnumOperationsForField({
      flatFieldMetadata: fieldMetadata,
      tableName,
      operation: EnumOperation.DROP,
    });

    await executeBatchEnumOperations({
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
    const {
      schemaName,
      tableName,
      flatObjectMetadataWithFlatFieldMaps: flatObjectMetadata,
    } = prepareWorkspaceSchemaContext({
      flatObjectMetadataMaps,
      objectMetadataId: flatFieldMetadata.objectMetadataId,
    });

    const enumOperations = collectEnumOperationsForField({
      flatFieldMetadata: flatFieldMetadata,
      tableName,
      operation: EnumOperation.CREATE,
    });

    await executeBatchEnumOperations({
      enumOperations,
      queryRunner,
      schemaName,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
    });

    const columnDefinitions = generateColumnDefinitions({
      flatFieldMetadata: flatFieldMetadata,
      flatObjectMetadataWithoutFields: flatObjectMetadata,
    });

    await this.workspaceSchemaManagerService.columnManager.addColumns({
      queryRunner,
      schemaName,
      tableName,
      columnDefinitions,
    });

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
      flatObjectMetadataWithFlatFieldMaps: flatObjectMetadata,
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
        isEnumFlatFieldMetadata(optimisticFlatFieldMetadata)
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
    flatFieldMetadata: FlatFieldMetadata,
    update: {
      property: 'name';
    } & FromTo<string>,
  ) {
    if (isCompositeFlatFieldMetadata(flatFieldMetadata)) {
      const compositeType = getCompositeTypeOrThrow(flatFieldMetadata.type);

      for (const property of compositeType.properties) {
        if (
          property.type === FieldMetadataType.RELATION ||
          property.type === FieldMetadataType.MORPH_RELATION
        ) {
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

        await this.workspaceSchemaManagerService.columnManager.renameColumn({
          queryRunner,
          schemaName,
          tableName,
          oldColumnName: fromCompositeColumnName,
          newColumnName: toCompositeColumnName,
        });
      }
    } else {
      await this.workspaceSchemaManagerService.columnManager.renameColumn({
        queryRunner,
        schemaName,
        tableName,
        oldColumnName: update.from,
        newColumnName: update.to,
      });
    }

    const enumOperations = collectEnumOperationsForField({
      flatFieldMetadata: flatFieldMetadata,
      tableName,
      operation: EnumOperation.RENAME,
      options: {
        newFieldName: update.to,
      },
    });

    await executeBatchEnumOperations({
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
    flatFieldMetadata: FlatFieldMetadata,
    update: {
      property: 'defaultValue';
    } & FromTo<FieldMetadataDefaultValueForAnyType>,
  ) {
    if (isCompositeFieldMetadataType(flatFieldMetadata.type)) {
      const compositeType = getCompositeTypeOrThrow(flatFieldMetadata.type);

      for (const property of compositeType.properties) {
        if (
          property.type === FieldMetadataType.RELATION ||
          property.type === FieldMetadataType.MORPH_RELATION
        ) {
          continue;
        }

        const compositeColumnName = computeCompositeColumnName(
          flatFieldMetadata.name,
          property,
        );
        // @ts-expect-error - TODO: fix this
        let compositeDefaultValue = update.to?.[property.name];

        const serializedNewDefaultValue = unserializeDefaultValue(
          compositeDefaultValue,
        );

        await this.workspaceSchemaManagerService.columnManager.alterColumnDefault(
          {
            queryRunner,
            schemaName,
            tableName,
            columnName: compositeColumnName,
            defaultValue: serializedNewDefaultValue,
          },
        );
      }
    } else {
      const serializedNewDefaultValue = unserializeDefaultValue(update.to);

      await this.workspaceSchemaManagerService.columnManager.alterColumnDefault(
        {
          queryRunner,
          schemaName,
          tableName,
          columnName: flatFieldMetadata.name,
          defaultValue: serializedNewDefaultValue,
        },
      );
    }
  }

  private async handleFieldOptionsUpdate(
    queryRunner: QueryRunner,
    schemaName: string,
    tableName: string,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadata: FlatFieldMetadata<EnumFieldMetadataType>,
    update: {
      property: 'options';
    } & FromTo<
      FieldMetadataDefaultOption[] | FieldMetadataComplexOption[] | null
    >,
  ) {
    const fromOptionsById = new Map(
      (update.from ?? [])
        .filter((opt) => isDefined(opt.id))
        .map((opt) => [opt.id, opt]),
    );

    const toOptionsById = new Map(
      (update.to ?? [])
        .filter((opt) => isDefined(opt.id))
        .map((opt) => [opt.id, opt]),
    );

    const valueMapping: Record<string, string> = {};

    for (const toOption of toOptionsById.values()) {
      const fromOption = fromOptionsById.get(toOption.id);

      if (fromOption) {
        valueMapping[fromOption.value] = toOption.value;
      }
    }

    const enumColumnDefinitions = generateColumnDefinitions({
      flatFieldMetadata: flatFieldMetadata,
      flatObjectMetadataWithoutFields: flatObjectMetadata,
    });

    for (const enumColumnDefinition of enumColumnDefinitions) {
      await this.workspaceSchemaManagerService.enumManager.alterEnumValues({
        queryRunner,
        schemaName,
        tableName,
        columnDefinition: enumColumnDefinition,
        enumValues: update.to?.map((opt) => opt.value) ?? [],
        oldToNewEnumOptionMap: valueMapping,
      });
    }
  }
}
