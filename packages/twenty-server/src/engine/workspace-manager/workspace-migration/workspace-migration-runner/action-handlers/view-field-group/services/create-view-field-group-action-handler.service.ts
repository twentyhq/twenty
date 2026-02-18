import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import { resolveUniversalRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-relation-identifiers-to-ids.util';
import {
  FlatCreateViewFieldGroupAction,
  UniversalCreateViewFieldGroupAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/view-field-group/types/workspace-migration-view-field-group-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateViewFieldGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'viewFieldGroup',
) {
  override async transpileUniversalActionToFlatAction({
    action,
    allFlatEntityMaps,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreateViewFieldGroupAction>): Promise<FlatCreateViewFieldGroupAction> {
    const { viewId } = resolveUniversalRelationIdentifiersToIds({
      flatEntityMaps: allFlatEntityMaps,
      metadataName: action.metadataName,
      universalForeignKeyValues: action.flatEntity,
    });

    const emptyUniversalForeignKeyAggregators =
      getUniversalFlatEntityEmptyForeignKeyAggregators({
        metadataName: 'viewFieldGroup',
      });

    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        viewId,
        id: action.id ?? v4(),
        applicationId: flatApplication.id,
        workspaceId,
        viewFieldIds: [],
        ...emptyUniversalForeignKeyAggregators,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateViewFieldGroupAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { flatEntity } = flatAction;

    const repository =
      queryRunner.manager.getRepository<ViewFieldGroupEntity>(
        ViewFieldGroupEntity,
      );

    await repository.insert({
      ...flatEntity,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateViewFieldGroupAction>,
  ): Promise<void> {
    return;
  }
}
