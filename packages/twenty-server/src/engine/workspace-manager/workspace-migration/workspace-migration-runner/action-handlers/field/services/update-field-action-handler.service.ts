import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ColumnType, type QueryRunner } from 'typeorm';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { getCompositeTypeOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-type-or-throw.util';
import { FlatEntityPropertiesToCompare } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-compare.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isCompositeUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration/types/property-update.type';
import { UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { convertOnDeleteActionToOnDelete } from 'src/engine/workspace-manager/workspace-migration/utils/convert-on-delete-action-to-on-delete.util';
import { findFlatEntityPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration/utils/find-flat-entity-property-update.util';
import { isPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration/utils/is-property-update.util';
import { UpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { serializeDefaultValue } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/utils/serialize-default-value.util';
import {
  WorkspaceMigrationActionExecutionException,
  WorkspaceMigrationActionExecutionExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-action-execution.exception';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { fieldMetadataTypeToColumnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/field-metadata-type-to-column-type.util';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-flat-entity-properties-updates-to-partial-flat-entity';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import {
  collectEnumOperationsForField,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/workspace-schema-enum-operations.util';

type UpdateFieldPropertyUpdateHandlerArgs<
  P extends FlatEntityPropertiesToCompare<'fieldMetadata'>,
  T extends FieldMetadataType = FieldMetadataType,
> = {
  queryRunner: QueryRunner;
  schemaName: string;
  tableName: string;
  universalFlatFieldMetadata: UniversalFlatFieldMetadata<T>;
  update: PropertyUpdate<FlatFieldMetadata, P>;
};

@Injectable()
export class UpdateFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'fieldMetadata',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateFieldAction>,
  ): Promise<void> {
    const { action, queryRunner, allFlatEntityMaps } = context;
    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );

    const { universalIdentifier } = action;

    const fromFlatFieldMetadata = findFlatEntityByUniversalIdentifierOrThrow({
      universalIdentifier,
      flatEntityMaps: allFlatEntityMaps.flatFieldMetadataMaps,
    });

    // TODO prastoin when migrated builder fromUniversalSettingsToInsertableSettings

    await fieldMetadataRepository.update(
      fromFlatFieldMetadata.id,
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
    );
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerArgs<UpdateFieldAction>,
  ): Promise<void> {
    const {
      action,
      queryRunner,
      allFlatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
      workspaceId,
    } = context;
    const { universalIdentifier, updates } = action;

    const currentFlatFieldMetadata = findFlatEntityByUniversalIdentifierOrThrow(
      {
        universalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      },
    );

    const universalFlatObjectMetadata =
      findFlatEntityByUniversalIdentifierOrThrow({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier:
          currentFlatFieldMetadata.objectMetadataUniversalIdentifier,
      });

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: universalFlatObjectMetadata,
    });

    let optimisticFlatFieldMetadata = structuredClone(currentFlatFieldMetadata);

    const defaultValueUpdate = findFlatEntityPropertyUpdate({
      flatEntityUpdates: updates,
      property: 'defaultValue',
    });
    const hasDefaultValueUpdate = isDefined(defaultValueUpdate);

    let wasDefaultValueHandledByEnumUpdate = false;

    const sortedUpdatesWithDefaultValuesUpdateLast = hasDefaultValueUpdate
      ? [
          ...updates.filter((update) => update.property !== 'defaultValue'),
          defaultValueUpdate,
        ]
      : updates;

    for (const update of sortedUpdatesWithDefaultValuesUpdateLast) {
      if (isPropertyUpdate(update, 'name')) {
        await this.handleFieldNameUpdate({
          queryRunner,
          schemaName,
          tableName,
          universalFlatFieldMetadata: optimisticFlatFieldMetadata,
          update,
        });
        optimisticFlatFieldMetadata.name = update.to;
      }
      if (isPropertyUpdate(update, 'defaultValue')) {
        if (wasDefaultValueHandledByEnumUpdate) {
          optimisticFlatFieldMetadata.defaultValue = update.to;
        } else {
          await this.handleFieldDefaultValueUpdate({
            queryRunner,
            schemaName,
            tableName,
            universalFlatFieldMetadata: optimisticFlatFieldMetadata,
            update,
          });
          optimisticFlatFieldMetadata.defaultValue = update.to;
        }
      }
      if (
        isPropertyUpdate(update, 'options') &&
        isEnumUniversalFlatFieldMetadata(optimisticFlatFieldMetadata)
      ) {
        if (hasDefaultValueUpdate) {
          optimisticFlatFieldMetadata = {
            ...optimisticFlatFieldMetadata,
            defaultValue: defaultValueUpdate.to,
          };
          wasDefaultValueHandledByEnumUpdate = true;
        }

        await this.handleFieldOptionsUpdate({
          queryRunner,
          schemaName,
          tableName,
          universalFlatFieldMetadata: optimisticFlatFieldMetadata,
          universalFlatObjectMetadata,
          update,
          workspaceId,
        });
        optimisticFlatFieldMetadata.options = update.to ?? [];
      }
      if (
        isPropertyUpdate(update, 'settings') &&
        isDefined(update.from?.joinColumnName) &&
        isDefined(update.to?.joinColumnName) &&
        update.from.joinColumnName !== update.to.joinColumnName &&
        isMorphOrRelationUniversalFlatFieldMetadata(optimisticFlatFieldMetadata)
      ) {
        await this.workspaceSchemaManagerService.columnManager.renameColumn({
          queryRunner,
          schemaName,
          tableName,
          oldColumnName: update.from.joinColumnName,
          newColumnName: update.to.joinColumnName,
        });
        optimisticFlatFieldMetadata = {
          ...optimisticFlatFieldMetadata,
          universalSettings: {
            ...optimisticFlatFieldMetadata.universalSettings,
            joinColumnName: update.to.joinColumnName,
          },
        };
      }
      if (
        isPropertyUpdate(update, 'settings') &&
        isDefined(update.to?.asExpression) &&
        isDefined(update.from?.asExpression) &&
        (update.to.asExpression !== update.from.asExpression ||
          update.to.generatedType !== update.from.generatedType)
      ) {
        await this.workspaceSchemaManagerService.columnManager.dropColumns({
          queryRunner,
          schemaName,
          tableName,
          columnNames: [optimisticFlatFieldMetadata.name],
        });
        await this.workspaceSchemaManagerService.columnManager.addColumns({
          queryRunner,
          schemaName,
          tableName,
          columnDefinitions: [
            {
              name: optimisticFlatFieldMetadata.name,
              type: 'tsvector',
              ...update.to,
            },
          ],
        });

        optimisticFlatFieldMetadata = {
          ...optimisticFlatFieldMetadata,
          universalSettings: update.to,
        };
      }

      if (
        isMorphOrRelationUniversalFlatFieldMetadata(
          optimisticFlatFieldMetadata,
        ) &&
        isDefined(
          optimisticFlatFieldMetadata.universalSettings.joinColumnName,
        ) &&
        isPropertyUpdate(update, 'settings') &&
        isDefined(update.from?.onDelete) &&
        isDefined(update.to?.onDelete) &&
        update.to.onDelete !== update.from.onDelete
      ) {
        const foreignKeyName =
          await this.workspaceSchemaManagerService.foreignKeyManager.getForeignKeyName(
            {
              queryRunner,
              schemaName,
              tableName,
              columnName:
                optimisticFlatFieldMetadata.universalSettings.joinColumnName,
            },
          );

        if (!isDefined(foreignKeyName)) {
          throw new WorkspaceMigrationActionExecutionException({
            message: 'Foreign key not found',
            code: WorkspaceMigrationActionExecutionExceptionCode.NOT_SUPPORTED,
          });
        }

        await this.workspaceSchemaManagerService.foreignKeyManager.dropForeignKey(
          {
            queryRunner,
            schemaName,
            tableName,
            foreignKeyName,
          },
        );

        const targetFlatObjectMetadata =
          findFlatEntityByUniversalIdentifierOrThrow({
            universalIdentifier:
              optimisticFlatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
            flatEntityMaps: flatObjectMetadataMaps,
          });

        const referencedTableName = computeObjectTargetTable(
          targetFlatObjectMetadata,
        );

        await this.workspaceSchemaManagerService.foreignKeyManager.createForeignKey(
          {
            queryRunner,
            schemaName,
            foreignKey: {
              tableName,
              columnName: update.to.joinColumnName,
              referencedTableName,
              referencedColumnName: 'id',
              onDelete:
                convertOnDeleteActionToOnDelete(update.to.onDelete) ??
                'CASCADE',
            },
          },
        );
      }
    }
  }

  private async handleFieldNameUpdate({
    universalFlatFieldMetadata,
    queryRunner,
    schemaName,
    tableName,
    update,
  }: UpdateFieldPropertyUpdateHandlerArgs<'name'>) {
    if (isCompositeUniversalFlatFieldMetadata(universalFlatFieldMetadata)) {
      const compositeType = getCompositeTypeOrThrow(
        universalFlatFieldMetadata.type,
      );

      for (const property of compositeType.properties) {
        if (isMorphOrRelationFieldMetadataType(property.type)) {
          throw new WorkspaceMigrationActionExecutionException({
            message:
              'Relation field metadata in composite type is not supported yet',
            code: WorkspaceMigrationActionExecutionExceptionCode.NOT_SUPPORTED,
          });
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
    } else if (
      !isMorphOrRelationUniversalFlatFieldMetadata(universalFlatFieldMetadata)
    ) {
      await this.workspaceSchemaManagerService.columnManager.renameColumn({
        queryRunner,
        schemaName,
        tableName,
        oldColumnName: update.from,
        newColumnName: update.to,
      });
    }

    const enumOperations = collectEnumOperationsForField({
      universalFlatFieldMetadata,
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
    universalFlatFieldMetadata,
    queryRunner,
    schemaName,
    tableName,
    update,
  }: UpdateFieldPropertyUpdateHandlerArgs<'defaultValue'>) {
    if (isCompositeUniversalFlatFieldMetadata(universalFlatFieldMetadata)) {
      const compositeType = getCompositeTypeOrThrow(
        universalFlatFieldMetadata.type,
      );

      for (const property of compositeType.properties) {
        const columnType = fieldMetadataTypeToColumnType(
          property.type,
        ) as ColumnType;

        if (isMorphOrRelationFieldMetadataType(property.type)) {
          throw new WorkspaceMigrationActionExecutionException({
            message:
              'Relation field metadata in composite type is not supported yet',
            code: WorkspaceMigrationActionExecutionExceptionCode.NOT_SUPPORTED,
          });
        }

        const compositeColumnName = computeCompositeColumnName(
          universalFlatFieldMetadata.name,
          property,
        );
        // @ts-expect-error - TODO: fix this
        let compositeDefaultValue = update.to?.[property.name]; // not valid should be serialized

        const serializedNewDefaultValue = serializeDefaultValue({
          columnName: compositeColumnName,
          schemaName,
          tableName,
          columnType,
          defaultValue: compositeDefaultValue,
        });

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

      return;
    }

    const columnType = fieldMetadataTypeToColumnType(
      universalFlatFieldMetadata.type,
    ) as ColumnType;

    const serializedNewDefaultValue = serializeDefaultValue({
      columnName: universalFlatFieldMetadata.name,
      schemaName,
      tableName,
      columnType,
      defaultValue: update.to,
    });

    return await this.workspaceSchemaManagerService.columnManager.alterColumnDefault(
      {
        queryRunner,
        schemaName,
        tableName,
        columnName: universalFlatFieldMetadata.name,
        defaultValue: serializedNewDefaultValue,
      },
    );
  }

  private async handleFieldOptionsUpdate({
    universalFlatFieldMetadata,
    queryRunner,
    schemaName,
    tableName,
    update,
    universalFlatObjectMetadata,
    workspaceId,
  }: UpdateFieldPropertyUpdateHandlerArgs<'options'> & {
    universalFlatObjectMetadata: UniversalFlatObjectMetadata;
    workspaceId: string;
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
      universalFlatFieldMetadata,
      universalFlatObjectMetadata,
      workspaceId,
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
