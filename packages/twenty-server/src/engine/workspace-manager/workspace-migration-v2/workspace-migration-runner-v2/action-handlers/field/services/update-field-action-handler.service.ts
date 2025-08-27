import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { ColumnType, type QueryRunner } from 'typeorm';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { getCompositeTypeOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-type-or-throw.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { unserializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/unserialize-default-value';
import { FlatFieldMetadataPropertiesToCompare } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-properties-to-compare.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { isRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-relation-flat-field-metadata.util';
import { findFlatFieldMetadataInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-field-metadata-in-flat-object-metadata-maps-or-throw.util';
import { findFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMapsOrThrow } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-with-flat-field-maps-in-flat-object-metadata-maps-or-throw.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-with-flat-field-maps-to-flat-object-metadatas.util';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { type UpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-field-action-v2';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/exceptions/workspace-migration-runner.exception';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromWorkspaceMigrationUpdateActionToPartialEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-workspace-migration-update-action-to-partial-field-or-object-entity.util';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/generate-column-definitions.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';
import {
  collectEnumOperationsForField,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/workspace-schema-enum-operations.util';

type UpdateFieldPropertyUpdateHandlerArgs<
  T extends FlatFieldMetadataPropertiesToCompare,
> = {
  queryRunner: QueryRunner;
  schemaName: string;
  tableName: string;
  flatFieldMetadata: FlatFieldMetadata;
  update: Extract<UpdateFieldAction['updates'][number], { property: T }>;
};

@Injectable()
export class UpdateFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_field',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateFieldAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );

    const { fieldMetadataId } = action;

    await fieldMetadataRepository.update(
      fieldMetadataId,
      fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    );
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<UpdateFieldAction>,
  ): Promise<void> {
    const { action, queryRunner, flatObjectMetadataMaps, workspaceId } =
      context;
    const { objectMetadataId, fieldMetadataId, updates } = action;

    const flatObjectMetadataWithFlatFieldMaps =
      findFlatObjectMetadataWithFlatFieldMapsInFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps,
        objectMetadataId,
      });

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      flatObjectMetadata: flatObjectMetadataWithFlatFieldMaps,
    });

    const currentFlatFieldMetadata =
      findFlatFieldMetadataInFlatObjectMetadataMapsOrThrow({
        flatObjectMetadataMaps,
        objectMetadataId,
        fieldMetadataId,
      });

    let optimisticFlatFieldMetadata = structuredClone(currentFlatFieldMetadata);

    for (const update of updates) {
      if (update.property === 'name') {
        await this.handleFieldNameUpdate({
          queryRunner,
          schemaName,
          tableName,
          flatFieldMetadata: optimisticFlatFieldMetadata,
          update,
        });
        optimisticFlatFieldMetadata.name = update.to;
      }
      if (update.property === 'defaultValue') {
        await this.handleFieldDefaultValueUpdate({
          queryRunner,
          schemaName,
          tableName,
          flatFieldMetadata: optimisticFlatFieldMetadata,
          update,
        });
        optimisticFlatFieldMetadata.defaultValue = update.to;
      }
      if (
        update.property === 'options' &&
        isEnumFlatFieldMetadata(optimisticFlatFieldMetadata)
      ) {
        await this.handleFieldOptionsUpdate({
          queryRunner,
          schemaName,
          tableName,
          flatObjectMetadata:
            fromFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadata(
              flatObjectMetadataWithFlatFieldMaps,
            ),
          flatFieldMetadata: optimisticFlatFieldMetadata,
          update,
        });
        optimisticFlatFieldMetadata.options = update.to ?? [];
      }
    }
  }

  private async handleFieldNameUpdate({
    flatFieldMetadata,
    queryRunner,
    schemaName,
    tableName,
    update,
  }: UpdateFieldPropertyUpdateHandlerArgs<'name'>) {
    if (isCompositeFlatFieldMetadata(flatFieldMetadata)) {
      const compositeType = getCompositeTypeOrThrow(flatFieldMetadata.type);

      for (const property of compositeType.properties) {
        if (isRelationFieldMetadataType(property.type)) {
          throw new WorkspaceMigrationRunnerException(
            'Relation field metadata in composite type is not supported yet',
            WorkspaceMigrationRunnerExceptionCode.NOT_SUPPORTED,
          );
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
      if (isRelationFlatFieldMetadata(flatFieldMetadata)) {
        throw new WorkspaceMigrationRunnerException(
          'Relation field metadata name update is not supported yet',
          WorkspaceMigrationRunnerExceptionCode.NOT_SUPPORTED,
        );
      }
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

  private async handleFieldDefaultValueUpdate({
    flatFieldMetadata,
    queryRunner,
    schemaName,
    tableName,
    update,
  }: UpdateFieldPropertyUpdateHandlerArgs<'defaultValue'>) {
    if (isCompositeFieldMetadataType(flatFieldMetadata.type)) {
      const compositeType = getCompositeTypeOrThrow(flatFieldMetadata.type);

      for (const property of compositeType.properties) {
        if (isRelationFieldMetadataType(property.type)) {
          throw new WorkspaceMigrationRunnerException(
            'Relation field metadata in composite type is not supported yet',
            WorkspaceMigrationRunnerExceptionCode.NOT_SUPPORTED,
          );
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
      const columnType = fieldMetadataTypeToColumnType(
        flatFieldMetadata.type,
      ) as ColumnType;
      const serializedNewDefaultValue = unserializeDefaultValue(update.to);

      await this.workspaceSchemaManagerService.columnManager.alterColumnDefault(
        {
          queryRunner,
          schemaName,
          tableName,
          columnName: flatFieldMetadata.name,
          defaultValue: serializedNewDefaultValue,
          columnType,
        },
      );
    }
  }

  private async handleFieldOptionsUpdate({
    flatFieldMetadata,
    queryRunner,
    schemaName,
    tableName,
    update,
    flatObjectMetadata,
  }: UpdateFieldPropertyUpdateHandlerArgs<'options'> & {
    flatObjectMetadata: FlatObjectMetadata;
  }) {
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
