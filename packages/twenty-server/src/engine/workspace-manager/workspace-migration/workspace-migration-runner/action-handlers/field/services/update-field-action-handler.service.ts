import { Injectable } from '@nestjs/common';

import {
  FieldMetadataSettingsMapping,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ColumnType, type QueryRunner } from 'typeorm';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { getCompositeTypeOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-type-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import { convertOnDeleteActionToOnDelete } from 'src/engine/workspace-manager/workspace-migration/utils/convert-on-delete-action-to-on-delete.util';
import {
  FlatUpdateFieldAction,
  UniversalUpdateFieldAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { serializeDefaultValue } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/utils/serialize-default-value.util';
import { fromUniversalSettingsToFlatFieldMetadataSettings } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/from-universal-settings-to-flat-field-metadata-settings.util';
import {
  WorkspaceMigrationActionExecutionException,
  WorkspaceMigrationActionExecutionExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-action-execution.exception';
import {
  type WorkspaceMigrationActionRunnerArgs,
  type WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { fieldMetadataTypeToColumnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/field-metadata-type-to-column-type.util';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import {
  collectEnumOperationsForField,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/workspace-schema-enum-operations.util';

type UpdateFieldPropertyHandlerArgs<
  T extends FieldMetadataType = FieldMetadataType,
> = {
  queryRunner: QueryRunner;
  schemaName: string;
  tableName: string;
  flatFieldMetadata: FlatFieldMetadata<T>;
  update: UniversalFlatEntityUpdate<'fieldMetadata'>;
};

type NameUpdateHandlerArgs<T extends FieldMetadataType = FieldMetadataType> =
  UpdateFieldPropertyHandlerArgs<T> & {
    toName: string;
  };

type DefaultValueUpdateHandlerArgs<
  T extends FieldMetadataType = FieldMetadataType,
> = UpdateFieldPropertyHandlerArgs<T> & {
  toDefaultValue: FlatFieldMetadata['defaultValue'];
};

type OptionsUpdateHandlerArgs<T extends FieldMetadataType = FieldMetadataType> =
  UpdateFieldPropertyHandlerArgs<T> & {
    toOptions: FlatFieldMetadata['options'];
    flatObjectMetadata: FlatObjectMetadata;
    workspaceId: string;
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

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateFieldAction>,
  ): Promise<FlatUpdateFieldAction> {
    const { action, allFlatEntityMaps } = context;

    const flatFieldMetadata = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatFieldMetadataMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const { universalSettings, ...updateWithResolvedForeignKeys } =
      resolveUniversalUpdateRelationIdentifiersToIds({
        metadataName: 'fieldMetadata',
        universalUpdate: action.update,
        allFlatEntityMaps,
      });

    const update =
      universalSettings === undefined
        ? updateWithResolvedForeignKeys
        : {
            ...updateWithResolvedForeignKeys,
            settings: fromUniversalSettingsToFlatFieldMetadataSettings({
              universalSettings,
              allFieldIdToBeCreatedInActionByUniversalIdentifierMap: new Map(),
              flatFieldMetadataMaps: allFlatEntityMaps.flatFieldMetadataMaps,
            }),
          };

    return {
      type: 'update',
      metadataName: 'fieldMetadata',
      entityId: flatFieldMetadata.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateFieldAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );

    const { entityId, update } = flatAction;

    await fieldMetadataRepository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateFieldAction>,
  ): Promise<void> {
    const {
      flatAction,
      queryRunner,
      allFlatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
      workspaceId,
    } = context;
    const { entityId, update } = flatAction;

    const currentFlatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: entityId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: currentFlatFieldMetadata.objectMetadataId,
    });

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: flatObjectMetadata,
    });

    let optimisticFlatFieldMetadata = structuredClone(currentFlatFieldMetadata);

    let wasDefaultValueHandledByEnumUpdate = false;

    if (isDefined(update.name)) {
      await this.handleFieldNameUpdate({
        queryRunner,
        schemaName,
        tableName,
        flatFieldMetadata: optimisticFlatFieldMetadata,
        update,
        toName: update.name,
      });
      optimisticFlatFieldMetadata.name = update.name;
    }

    if (
      update.options !== undefined &&
      isEnumFlatFieldMetadata(optimisticFlatFieldMetadata)
    ) {
      if (update.defaultValue !== undefined) {
        optimisticFlatFieldMetadata = {
          ...optimisticFlatFieldMetadata,
          defaultValue: update.defaultValue,
        };
        wasDefaultValueHandledByEnumUpdate = true;
      }

      await this.handleFieldOptionsUpdate({
        queryRunner,
        schemaName,
        tableName,
        flatFieldMetadata: optimisticFlatFieldMetadata,
        flatObjectMetadata,
        toOptions: update.options,
        workspaceId,
        update,
      });
      optimisticFlatFieldMetadata.options = update.options ?? [];
    }

    if (update.defaultValue !== undefined) {
      if (wasDefaultValueHandledByEnumUpdate) {
        optimisticFlatFieldMetadata.defaultValue = update.defaultValue;
      } else {
        await this.handleFieldDefaultValueUpdate({
          queryRunner,
          schemaName,
          tableName,
          flatFieldMetadata: optimisticFlatFieldMetadata,
          toDefaultValue: update.defaultValue,
          update,
        });
        optimisticFlatFieldMetadata.defaultValue = update.defaultValue;
      }
    }

    if (isDefined(update.settings)) {
      // Handle joinColumnName rename
      if (isMorphOrRelationFlatFieldMetadata(optimisticFlatFieldMetadata)) {
        const fromSettings = optimisticFlatFieldMetadata.settings;
        const toSettings = update.settings as
          | FieldMetadataSettingsMapping['MORPH_RELATION']
          | FieldMetadataSettingsMapping['RELATION'];

        if (
          isDefined(fromSettings?.joinColumnName) &&
          isDefined(toSettings?.joinColumnName) &&
          fromSettings.joinColumnName !== toSettings.joinColumnName
        ) {
          await this.workspaceSchemaManagerService.columnManager.renameColumn({
            queryRunner,
            schemaName,
            tableName,
            oldColumnName: fromSettings.joinColumnName,
            newColumnName: toSettings.joinColumnName,
          });
          optimisticFlatFieldMetadata = {
            ...optimisticFlatFieldMetadata,
            settings: {
              ...optimisticFlatFieldMetadata.settings,
              joinColumnName: toSettings.joinColumnName,
            },
          };
        }
      }

      // Handle asExpression/generatedType change (for TS_VECTOR fields)
      if (
        isFlatFieldMetadataOfType(
          optimisticFlatFieldMetadata,
          FieldMetadataType.TS_VECTOR,
        )
      ) {
        const fromSettings =
          optimisticFlatFieldMetadata.settings as FieldMetadataSettingsMapping['TS_VECTOR'];
        const toSettings =
          update.settings as FieldMetadataSettingsMapping['TS_VECTOR'];

        if (
          isDefined(toSettings?.asExpression) &&
          isDefined(fromSettings?.asExpression) &&
          (toSettings.asExpression !== fromSettings.asExpression ||
            toSettings.generatedType !== fromSettings.generatedType)
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
                ...toSettings,
              },
            ],
          });

          optimisticFlatFieldMetadata = {
            ...optimisticFlatFieldMetadata,
            settings: toSettings,
          };
        }
      }

      // Handle onDelete change (for morph/relation fields) order matters
      if (isMorphOrRelationFlatFieldMetadata(optimisticFlatFieldMetadata)) {
        const fromSettings = optimisticFlatFieldMetadata.settings;
        const toSettings = update.settings as
          | FieldMetadataSettingsMapping['MORPH_RELATION']
          | FieldMetadataSettingsMapping['RELATION'];

        if (
          isDefined(optimisticFlatFieldMetadata.settings.joinColumnName) &&
          isDefined(fromSettings?.onDelete) &&
          isDefined(toSettings?.onDelete) &&
          toSettings.onDelete !== fromSettings.onDelete
        ) {
          const foreignKeyName =
            await this.workspaceSchemaManagerService.foreignKeyManager.getForeignKeyName(
              {
                queryRunner,
                schemaName,
                tableName,
                columnName: optimisticFlatFieldMetadata.settings.joinColumnName,
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
            findFlatEntityByIdInFlatEntityMapsOrThrow({
              flatEntityId:
                optimisticFlatFieldMetadata.relationTargetObjectMetadataId,
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
                columnName: optimisticFlatFieldMetadata.settings.joinColumnName,
                referencedTableName,
                referencedColumnName: 'id',
                onDelete:
                  convertOnDeleteActionToOnDelete(toSettings.onDelete) ??
                  'CASCADE',
              },
            },
          );
        }
      }
    }
  }

  private async handleFieldNameUpdate({
    flatFieldMetadata,
    queryRunner,
    schemaName,
    tableName,
    toName,
  }: NameUpdateHandlerArgs) {
    const fromName = flatFieldMetadata.name;

    if (isCompositeFlatFieldMetadata(flatFieldMetadata)) {
      const compositeType = getCompositeTypeOrThrow(flatFieldMetadata.type);

      for (const property of compositeType.properties) {
        if (isMorphOrRelationFieldMetadataType(property.type)) {
          throw new WorkspaceMigrationActionExecutionException({
            message:
              'Relation field metadata in composite type is not supported yet',
            code: WorkspaceMigrationActionExecutionExceptionCode.NOT_SUPPORTED,
          });
        }

        const fromCompositeColumnName = computeCompositeColumnName(
          fromName,
          property,
        );
        const toCompositeColumnName = computeCompositeColumnName(
          toName,
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
    } else if (!isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
      await this.workspaceSchemaManagerService.columnManager.renameColumn({
        queryRunner,
        schemaName,
        tableName,
        oldColumnName: fromName,
        newColumnName: toName,
      });
    }

    const enumOperations = collectEnumOperationsForField({
      flatFieldMetadata,
      tableName,
      operation: EnumOperation.RENAME,
      options: {
        newFieldName: toName,
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
    toDefaultValue,
  }: DefaultValueUpdateHandlerArgs) {
    if (isCompositeFlatFieldMetadata(flatFieldMetadata)) {
      const compositeType = getCompositeTypeOrThrow(flatFieldMetadata.type);

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
          flatFieldMetadata.name,
          property,
        );
        // @ts-expect-error - TODO: fix this
        const compositeDefaultValue = toDefaultValue?.[property.name];

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
      flatFieldMetadata.type,
    ) as ColumnType;

    const serializedNewDefaultValue = serializeDefaultValue({
      columnName: flatFieldMetadata.name,
      schemaName,
      tableName,
      columnType,
      defaultValue: toDefaultValue,
    });

    return await this.workspaceSchemaManagerService.columnManager.alterColumnDefault(
      {
        queryRunner,
        schemaName,
        tableName,
        columnName: flatFieldMetadata.name,
        defaultValue: serializedNewDefaultValue,
      },
    );
  }

  private async handleFieldOptionsUpdate({
    flatFieldMetadata,
    queryRunner,
    schemaName,
    tableName,
    toOptions,
    flatObjectMetadata,
    workspaceId,
  }: OptionsUpdateHandlerArgs) {
    const fromOptions = flatFieldMetadata.options;
    const fromOptionsById = new Map(
      (fromOptions ?? [])
        .filter((opt) => isDefined(opt.id))
        .map((opt) => [opt.id, opt]),
    );

    const toOptionsById = new Map(
      (toOptions ?? [])
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
      flatFieldMetadata,
      flatObjectMetadata,
      workspaceId,
    });

    for (const enumColumnDefinition of enumColumnDefinitions) {
      await this.workspaceSchemaManagerService.enumManager.alterEnumValues({
        queryRunner,
        schemaName,
        tableName,
        columnDefinition: enumColumnDefinition,
        enumValues: toOptions?.map((opt) => opt.value) ?? [],
        oldToNewEnumOptionMap: valueMapping,
      });
    }
  }
}
