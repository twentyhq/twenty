import { Injectable } from '@nestjs/common';

import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
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

    const allFieldIdToBeCreatedInActionByUniversalIdentifierMap = new Map<
      string,
      string
    >(Object.entries(action.fieldIdByUniversalIdentifier ?? {}));

    if (
      !allFieldIdToBeCreatedInActionByUniversalIdentifierMap.has(
        action.flatEntity.universalIdentifier,
      )
    ) {
      allFieldIdToBeCreatedInActionByUniversalIdentifierMap.set(
        action.flatEntity.universalIdentifier,
        action.id ?? v4(),
      );
    }

    if (
      isDefined(action.relatedUniversalFlatFieldMetadata) &&
      !allFieldIdToBeCreatedInActionByUniversalIdentifierMap.has(
        action.relatedUniversalFlatFieldMetadata.universalIdentifier,
      )
    ) {
      allFieldIdToBeCreatedInActionByUniversalIdentifierMap.set(
        action.relatedUniversalFlatFieldMetadata.universalIdentifier,
        action.relatedFieldId ?? v4(),
      );
    }

    const universalFlatFieldMetadatas = isDefined(
      action.relatedUniversalFlatFieldMetadata,
    )
      ? [action.flatEntity, action.relatedUniversalFlatFieldMetadata]
      : [action.flatEntity];

    const [flatFieldMetadata, relatedFlatFieldMetadata] =
      universalFlatFieldMetadatas.map((universalFlatFieldMetadata) =>
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
      flatEntity: flatFieldMetadata,
      relatedFlatFieldMetadata,
    };
  }

  override canBatchCreate = true;

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateFieldAction>,
  ): Promise<void> {
    const { queryRunner, flatAction } = context;
    const { flatEntity, relatedFlatFieldMetadata } = flatAction;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatEntity, relatedFlatFieldMetadata].filter(isDefined),
    });
  }

  override async executeForMetadataBatch(
    contexts: WorkspaceMigrationActionRunnerContext<FlatCreateFieldAction>[],
  ): Promise<void> {
    if (contexts.length === 0) {
      return;
    }

    const flatEntities = contexts.flatMap((context) =>
      [
        context.flatAction.flatEntity,
        context.flatAction.relatedFlatFieldMetadata,
      ].filter(isDefined),
    );

    await this.insertFlatEntitiesInRepository({
      queryRunner: contexts[0].queryRunner,
      flatEntities,
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
    const { flatEntity, relatedFlatFieldMetadata } = flatAction;

    await this.applyFieldsToWorkspaceSchema({
      flatFieldMetadatas: [flatEntity, relatedFlatFieldMetadata].filter(
        isDefined,
      ),
      flatObjectMetadataMaps,
      queryRunner,
      workspaceId,
    });
  }

  override async executeForWorkspaceSchemaBatch(
    contexts: WorkspaceMigrationActionRunnerContext<FlatCreateFieldAction>[],
  ): Promise<void> {
    if (contexts.length === 0) {
      return;
    }

    const flatFieldMetadatas = contexts.flatMap((context) =>
      [
        context.flatAction.flatEntity,
        context.flatAction.relatedFlatFieldMetadata,
      ].filter(isDefined),
    );

    await this.applyFieldsToWorkspaceSchema({
      flatFieldMetadatas,
      flatObjectMetadataMaps:
        contexts[0].allFlatEntityMaps.flatObjectMetadataMaps,
      queryRunner: contexts[0].queryRunner,
      workspaceId: contexts[0].workspaceId,
    });
  }

  private async applyFieldsToWorkspaceSchema({
    flatFieldMetadatas,
    flatObjectMetadataMaps,
    queryRunner,
    workspaceId,
  }: {
    flatFieldMetadatas: FlatFieldMetadata[];
    flatObjectMetadataMaps: MetadataFlatEntityMaps<'objectMetadata'>;
    queryRunner: QueryRunner;
    workspaceId: string;
  }): Promise<void> {
    const fieldsByObjectMetadataId = new Map<string, FlatFieldMetadata[]>();

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

      const enumOperations = objectFlatFieldMetadatas.flatMap(
        (flatFieldMetadata) =>
          collectEnumOperationsForField({
            flatFieldMetadata,
            tableName,
            operation: EnumOperation.CREATE,
          }),
      );

      await executeBatchEnumOperations({
        enumOperations,
        queryRunner,
        schemaName,
        workspaceSchemaManagerService: this.workspaceSchemaManagerService,
      });

      const columnDefinitions = objectFlatFieldMetadatas.flatMap(
        (flatFieldMetadata) =>
          generateColumnDefinitions({
            flatFieldMetadata,
            flatObjectMetadata,
            workspaceId,
          }),
      );

      await this.workspaceSchemaManagerService.columnManager.addColumns({
        queryRunner,
        schemaName,
        tableName,
        columnDefinitions,
      });

      for (const flatFieldMetadata of objectFlatFieldMetadatas) {
        await this.createRelationForeignKeyIfNeeded({
          flatFieldMetadata,
          flatObjectMetadataMaps,
          queryRunner,
          schemaName,
          tableName,
        });
      }
    }
  }

  private async createRelationForeignKeyIfNeeded({
    flatFieldMetadata,
    flatObjectMetadataMaps,
    queryRunner,
    schemaName,
    tableName,
  }: {
    flatFieldMetadata: FlatFieldMetadata;
    flatObjectMetadataMaps: MetadataFlatEntityMaps<'objectMetadata'>;
    queryRunner: QueryRunner;
    schemaName: string;
    tableName: string;
  }): Promise<void> {
    if (
      !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) ||
      flatFieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE
    ) {
      return;
    }

    const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId!,
    });
    const referencedTableName = computeObjectTargetTable(
      targetFlatObjectMetadata,
    );

    const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: flatFieldMetadata.name,
    });

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
