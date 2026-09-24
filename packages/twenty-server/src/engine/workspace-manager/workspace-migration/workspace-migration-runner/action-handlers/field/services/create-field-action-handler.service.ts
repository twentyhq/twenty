import { Injectable } from '@nestjs/common';

import {
  FeatureFlagKey,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';
import { v4 } from 'uuid';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { buildManyToOneForeignKeyDefinition } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/field/services/utils/build-many-to-one-foreign-key-definition.util';
import { type DeferredWorkspaceMigrationActionExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action-execution-args.type';
import { type DeferredWorkspaceMigrationActionPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';
import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { resolveSearchVectorAsExpressionForTsVectorField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/resolve-search-vector-as-expression-for-ts-vector-field.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
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

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateFieldAction>,
  ): Promise<void> {
    const {
      flatAction,
      queryRunner,
      allFlatEntityMaps: {
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        flatSearchFieldMetadataMaps,
      },
      getSearchFieldMetadatasByTsVectorFieldId,
      workspaceId,
    } = context;
    const { flatEntity, relatedFlatFieldMetadata } = flatAction;

    const deferredForeignKeyValidation =
      this.getDeferredForeignKeyValidation(context);

    const fieldsByObjectMetadataId = new Map<string, FlatFieldMetadata[]>();

    for (const flatFieldMetadata of [
      flatEntity,
      relatedFlatFieldMetadata,
    ].filter(isDefined)) {
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
      createdFlatFieldMetadatas,
    ] of fieldsByObjectMetadataId) {
      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatObjectMetadataMaps,
        flatEntityId: objectMetadataId,
      });

      const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
        workspaceId,
        objectMetadata: flatObjectMetadata,
      });

      const objectFlatFieldMetadatas = [
        ...findManyFlatEntityByIdInFlatEntityMaps({
          flatEntityMaps: flatFieldMetadataMaps,
          flatEntityIds: flatObjectMetadata.fieldIds,
        }),
        ...createdFlatFieldMetadatas,
      ];

      for (const flatFieldMetadata of createdFlatFieldMetadatas) {
        await this.executeSingleFieldMetadataWorkspaceSchema({
          flatFieldMetadata,
          isForeignKeyValidationDeferred:
            deferredForeignKeyValidation?.payload.fieldMetadataId ===
            flatFieldMetadata.id,
          flatObjectMetadata,
          flatObjectMetadataMaps,
          objectFlatFieldMetadatas,
          flatSearchFieldMetadataMaps,
          getSearchFieldMetadatasByTsVectorFieldId,
          queryRunner,
          schemaName,
          tableName,
          workspaceId,
        });
      }
    }
  }

  override getDeferredAction(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateFieldAction>,
  ) {
    return this.getDeferredForeignKeyValidation(context);
  }

  override async executeDeferredAction({
    workspaceId,
    payload: { fieldMetadataId },
    allFlatEntityMaps: { flatFieldMetadataMaps, flatObjectMetadataMaps },
    queryRunner,
  }: DeferredWorkspaceMigrationActionExecutionArgs<
    DeferredWorkspaceMigrationActionPayload<'validateForeignKey'>
  >): Promise<void> {
    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: fieldMetadataId,
    });

    if (!isDefined(flatFieldMetadata)) {
      return;
    }

    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: flatObjectMetadataMaps,
      flatEntityId: flatFieldMetadata.objectMetadataId,
    });

    if (!isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
      return;
    }

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: flatObjectMetadata,
    });

    await this.workspaceSchemaManagerService.foreignKeyManager.validateForeignKey(
      {
        queryRunner,
        schemaName,
        foreignKey: buildManyToOneForeignKeyDefinition({
          flatFieldMetadata,
          flatObjectMetadataMaps,
          tableName,
        }),
      },
    );
  }

  private getDeferredForeignKeyValidation({
    flatAction,
    featureFlagsMap,
  }: WorkspaceMigrationActionRunnerContext<FlatCreateFieldAction>):
    | {
        name: 'validateForeignKey';
        payload: DeferredWorkspaceMigrationActionPayload<'validateForeignKey'>;
      }
    | undefined {
    if (
      !featureFlagsMap?.[
        FeatureFlagKey.IS_DEFERRED_WORKSPACE_MIGRATION_ACTIONS_ENABLED
      ]
    ) {
      return undefined;
    }

    const flatFieldMetadata = [
      flatAction.flatEntity,
      flatAction.relatedFlatFieldMetadata,
    ]
      .filter(isDefined)
      .find(
        (createdFlatFieldMetadata) =>
          isMorphOrRelationFlatFieldMetadata(createdFlatFieldMetadata) &&
          createdFlatFieldMetadata.settings?.relationType ===
            RelationType.MANY_TO_ONE,
      );

    if (!isDefined(flatFieldMetadata)) {
      return undefined;
    }

    return {
      name: 'validateForeignKey' as const,
      payload: { fieldMetadataId: flatFieldMetadata.id },
    };
  }

  private async executeSingleFieldMetadataWorkspaceSchema({
    flatFieldMetadata,
    isForeignKeyValidationDeferred,
    flatObjectMetadata,
    flatObjectMetadataMaps,
    objectFlatFieldMetadatas,
    flatSearchFieldMetadataMaps,
    getSearchFieldMetadatasByTsVectorFieldId,
    queryRunner,
    schemaName,
    tableName,
    workspaceId,
  }: {
    flatFieldMetadata: FlatFieldMetadata;
    isForeignKeyValidationDeferred: boolean;
    flatObjectMetadata: FlatObjectMetadata;
    flatObjectMetadataMaps: MetadataFlatEntityMaps<'objectMetadata'>;
    objectFlatFieldMetadatas: FlatFieldMetadata[];
    flatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>;
    getSearchFieldMetadatasByTsVectorFieldId?: (
      tsVectorFieldMetadataId: string,
    ) => FlatSearchFieldMetadata[];
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
      searchVectorAsExpression: isFlatFieldMetadataOfType(
        flatFieldMetadata,
        FieldMetadataType.TS_VECTOR,
      )
        ? resolveSearchVectorAsExpressionForTsVectorField({
            tsVectorFieldMetadataId: flatFieldMetadata.id,
            objectFlatFieldMetadatas,
            flatSearchFieldMetadataMaps,
            getSearchFieldMetadatasByTsVectorFieldId,
          })
        : undefined,
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
      await this.workspaceSchemaManagerService.foreignKeyManager.createForeignKey(
        {
          queryRunner,
          schemaName,
          foreignKey: buildManyToOneForeignKeyDefinition({
            flatFieldMetadata,
            flatObjectMetadataMaps,
            tableName,
          }),
          isNotValid: isForeignKeyValidationDeferred,
        },
      );
    }
  }
}
