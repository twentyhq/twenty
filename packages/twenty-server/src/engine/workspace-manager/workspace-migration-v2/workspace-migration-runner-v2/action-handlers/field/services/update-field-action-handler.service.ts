import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ColumnType, type QueryRunner } from 'typeorm';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { getCompositeTypeOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-type-or-throw.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { FlatEntityPropertiesToCompare } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-to-compare.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { PropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/types/property-update.type';
import { findFlatEntityPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/utils/find-flat-entity-property-update.util';
import { isPropertyUpdate } from 'src/engine/workspace-manager/workspace-migration-v2/utils/is-property-update.util';
import { type UpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/field/types/workspace-migration-field-action-v2';
import { serializeDefaultValueV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/serialize-default-value-v2.util';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/exceptions/workspace-migration-runner.exception';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/generate-column-definitions.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';
import {
  collectEnumOperationsForField,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/workspace-schema-enum-operations.util';

type UpdateFieldPropertyUpdateHandlerArgs<
  P extends FlatEntityPropertiesToCompare<'fieldMetadata'>,
  T extends FieldMetadataType = FieldMetadataType,
> = {
  queryRunner: QueryRunner;
  schemaName: string;
  tableName: string;
  flatFieldMetadata: FlatFieldMetadata<T>;
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
    const { action, queryRunner } = context;
    const fieldMetadataRepository =
      queryRunner.manager.getRepository<FieldMetadataEntity>(
        FieldMetadataEntity,
      );

    const { entityId } = action;

    await fieldMetadataRepository.update(
      entityId,
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
    const { objectMetadataId, entityId, updates } = action;

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      flatObjectMetadata,
    });

    const currentFlatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: entityId,
      flatEntityMaps: flatFieldMetadataMaps,
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
          flatFieldMetadata: optimisticFlatFieldMetadata,
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
            flatFieldMetadata: optimisticFlatFieldMetadata,
            update,
          });
          optimisticFlatFieldMetadata.defaultValue = update.to;
        }
      }
      if (
        isPropertyUpdate(update, 'options') &&
        isEnumFlatFieldMetadata(optimisticFlatFieldMetadata)
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
          flatObjectMetadata,
          flatFieldMetadata: optimisticFlatFieldMetadata,
          update,
        });
        optimisticFlatFieldMetadata.options = update.to ?? [];
      }
      if (
        isPropertyUpdate(update, 'settings') &&
        isDefined(update.from?.joinColumnName) &&
        isDefined(update.to?.joinColumnName) &&
        update.from.joinColumnName !== update.to.joinColumnName &&
        isMorphOrRelationFlatFieldMetadata(optimisticFlatFieldMetadata)
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
          settings: {
            ...optimisticFlatFieldMetadata.settings,
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
          settings: update.to,
        };
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
        if (isMorphOrRelationFieldMetadataType(property.type)) {
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
    } else if (!isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
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
        const columnType = fieldMetadataTypeToColumnType(
          property.type,
        ) as ColumnType;

        if (isMorphOrRelationFieldMetadataType(property.type)) {
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
        let compositeDefaultValue = update.to?.[property.name]; // not valid should be serialized

        const serializedNewDefaultValue = serializeDefaultValueV2({
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

    const serializedNewDefaultValue = serializeDefaultValueV2({
      columnName: flatFieldMetadata.name,
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
      flatObjectMetadata: flatObjectMetadata,
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
