import { Injectable } from '@nestjs/common';

import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { convertOnDeleteActionToOnDelete } from 'src/engine/workspace-manager/workspace-migration/utils/convert-on-delete-action-to-on-delete.util';
import {
  type FlatCreateFieldAction,
  type UniversalCreateFieldAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { fromUniversalFlatFieldMetadataToFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/from-universal-flat-field-metadata-to-flat-field-metadata.util';
import {
  WorkspaceMigrationActionRunnerContext,
  type WorkspaceMigrationActionRunnerArgs,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { generateColumnDefinitions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/generate-column-definitions.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import {
  collectEnumOperationsForField,
  EnumOperation,
  executeBatchEnumOperations,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/workspace-schema-enum-operations.util';

@Injectable()
export class CreateFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'fieldMetadata',
) {
  constructor(
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalCreateFieldAction>,
  ): Promise<FlatCreateFieldAction> {
    const { action, allFlatEntityMaps } = context;
    const { universalFlatFieldMetadatas, fieldIdByUniversalIdentifier } =
      action;

    const allFieldIdToBeCreatedInActionByUniversalIdentifierMap = new Map<
      string,
      string
    >();

    for (const universalFlatFieldMetadata of universalFlatFieldMetadatas) {
      const providedId =
        fieldIdByUniversalIdentifier?.[
          universalFlatFieldMetadata.universalIdentifier
        ];

      allFieldIdToBeCreatedInActionByUniversalIdentifierMap.set(
        universalFlatFieldMetadata.universalIdentifier,
        providedId ?? v4(),
      );
    }

    const flatFieldMetadatas = universalFlatFieldMetadatas.map(
      (universalFlatFieldMetadata) =>
        fromUniversalFlatFieldMetadataToFlatFieldMetadata({
          universalFlatFieldMetadata,
          allFieldIdToBeCreatedInActionByUniversalIdentifierMap,
          allFlatEntityMaps,
          context,
        }),
    );

    return {
      type: action.type,
      metadataName: action.metadataName,
      flatFieldMetadatas,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateFieldAction>,
  ): Promise<void> {
    const { queryRunner, flatAction } = context;
    const { flatFieldMetadatas } = flatAction;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: flatFieldMetadatas,
    });
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateFieldAction>,
  ): Promise<void> {
    const {
      flatAction,
      queryRunner,
      allFlatEntityMaps: { flatObjectMetadataMaps },
      workspaceId,
    } = context;
    const { flatFieldMetadatas } = flatAction;

    const fieldsByObjectMetadataId = new Map<
      string,
      typeof flatFieldMetadatas
    >();

    for (const flatFieldMetadata of flatFieldMetadatas) {
      const existingFields = fieldsByObjectMetadataId.get(
        flatFieldMetadata.objectMetadataId,
      );

      if (isDefined(existingFields)) {
        existingFields.push(flatFieldMetadata);
      } else {
        fieldsByObjectMetadataId.set(flatFieldMetadata.objectMetadataId, [
          flatFieldMetadata,
        ]);
      }
    }

    for (const [
      objectMetadataId,
      objectFlatFieldMetadatas,
    ] of fieldsByObjectMetadataId) {
      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatObjectMetadataMaps,
        flatEntityId: objectMetadataId,
      });

      const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
        workspaceId,
        objectMetadata: flatObjectMetadata,
      });

      for (const flatFieldMetadata of objectFlatFieldMetadatas) {
        await this.executeSingleFieldMetadataWorkspaceSchema({
          flatFieldMetadata,
          flatObjectMetadata,
          flatObjectMetadataMaps,
          queryRunner,
          schemaName,
          tableName,
          workspaceId,
        });
      }
    }
  }

  private async executeSingleFieldMetadataWorkspaceSchema({
    flatFieldMetadata,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    queryRunner,
    schemaName,
    tableName,
    workspaceId,
  }: {
    flatFieldMetadata: FlatFieldMetadata;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: MetadataFlatEntityMaps<'objectMetadata'>;
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
    workspaceId: string;
  }): Promise<void> {
    const enumOperations = collectEnumOperationsForField({
      flatFieldMetadata,
      tableName,
      operation: EnumOperation.CREATE,
    });

    const columnDefinitions = generateColumnDefinitions({
      flatFieldMetadata,
      flatObjectMetadata,
      workspaceId,
    });

    await executeBatchEnumOperations({
      enumOperations,
      queryRunner,
      schemaName,
      workspaceSchemaManagerService: this.workspaceSchemaManagerService,
    });

    await this.workspaceSchemaManagerService.columnManager.addColumns({
      queryRunner,
      schemaName,
      tableName,
      columnDefinitions,
    });

    if (
      isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
      flatFieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE
    ) {
      const targetFlatObjectMetadata =
        findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityMaps: flatObjectMetadataMaps,
          flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId!,
        });
      const referencedTableName = computeObjectTargetTable(
        targetFlatObjectMetadata,
      );

      const joinColumnName = flatFieldMetadata.settings?.joinColumnName;

      if (!isDefined(joinColumnName)) {
        throw new Error(
          'Join column name is not defined in a MANY_TO_ONE relation',
        );
      }

      await this.workspaceSchemaManagerService.foreignKeyManager.createForeignKey(
        {
          queryRunner,
          schemaName,
          foreignKey: {
            tableName,
            columnName: joinColumnName,
            referencedTableName,
            referencedColumnName: 'id',
            onDelete:
              convertOnDeleteActionToOnDelete(
                flatFieldMetadata.settings?.onDelete,
              ) ?? 'CASCADE',
          },
        },
      );
    }
  }
}
