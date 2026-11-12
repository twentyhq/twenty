import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import { resolveUniversalRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import {
  FlatCreateFieldMetadataOptionAction,
  UniversalCreateFieldMetadataOptionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field-metadata-option/types/workspace-migration-field-metadata-option-action.type';
import { FieldMetadataOptionEnumSchemaService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/field-metadata-option-enum-schema.service';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateFieldMetadataOptionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'fieldMetadataOption',
) {
  constructor(
    private readonly fieldMetadataOptionEnumSchemaService: FieldMetadataOptionEnumSchemaService,
  ) {
    super();
  }

  override async transpileUniversalActionToFlatAction({
    action,
    allFlatEntityMaps,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreateFieldMetadataOptionAction>): Promise<FlatCreateFieldMetadataOptionAction> {
    const { fieldMetadataId } = resolveUniversalRelationIdentifiersToIds({
      flatEntityMaps: allFlatEntityMaps,
      metadataName: action.metadataName,
      universalForeignKeyValues: action.flatEntity,
    });

    const emptyUniversalForeignKeyAggregators =
      getUniversalFlatEntityEmptyForeignKeyAggregators({
        metadataName: 'fieldMetadataOption',
      });

    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        fieldMetadataId,
        applicationId: flatApplication.id,
        id: action.id ?? v4(),
        workspaceId,
        ...emptyUniversalForeignKeyAggregators,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateFieldMetadataOptionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { flatEntity } = flatAction;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatEntity],
    });
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerContext<
      FlatCreateFieldMetadataOptionAction,
      UniversalCreateFieldMetadataOptionAction
    >,
  ): Promise<void> {
    await this.fieldMetadataOptionEnumSchemaService.applyEnumChangeOfOptionAction(
      {
        fieldMetadataUniversalIdentifier:
          context.flatAction.flatEntity.fieldMetadataUniversalIdentifier,
        fieldMetadataOptionEnumChangeTracker:
          context.fieldMetadataOptionEnumChangeTracker,
        allFlatEntityMaps: context.allFlatEntityMaps,
        queryRunner: context.queryRunner,
        workspaceId: context.workspaceId,
      },
    );
  }
}
