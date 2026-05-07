import { Injectable } from '@nestjs/common';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { PermissionFlagDefinitionEntity } from 'src/engine/metadata-modules/permission-flag-definition/entities/permission-flag-definition.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  type FlatUpdatePermissionFlagDefinitionAction,
  type UniversalUpdatePermissionFlagDefinitionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/permission-flag-definition/types/workspace-migration-permission-flag-definition-action.type';
import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';
import {
  type WorkspaceMigrationActionRunnerArgs,
  type WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdatePermissionFlagDefinitionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'permissionFlagDefinition',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdatePermissionFlagDefinitionAction>,
  ): Promise<FlatUpdatePermissionFlagDefinitionAction> {
    const { action, allFlatEntityMaps } = context;

    const flatDefinition = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatPermissionFlagDefinitionMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'permissionFlagDefinition',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'permissionFlagDefinition',
      entityId: flatDefinition.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdatePermissionFlagDefinitionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const repository =
      queryRunner.manager.getRepository<PermissionFlagDefinitionEntity>(
        PermissionFlagDefinitionEntity,
      );

    await repository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdatePermissionFlagDefinitionAction>,
  ): Promise<void> {
    return;
  }
}
