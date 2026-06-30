import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateRolePermissionFlagAction,
  UniversalUpdateRolePermissionFlagAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role-permission-flag/types/workspace-migration-role-permission-flag-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateRolePermissionFlagActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'rolePermissionFlag',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateRolePermissionFlagAction>,
  ): Promise<FlatUpdateRolePermissionFlagAction> {
    const { action, allFlatEntityMaps } = context;

    const flatRolePermissionFlag = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatRolePermissionFlagMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'rolePermissionFlag',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'rolePermissionFlag',
      entityId: flatRolePermissionFlag.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateRolePermissionFlagAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const rolePermissionFlagRepository =
      queryRunner.manager.getRepository<RolePermissionFlagEntity>(
        RolePermissionFlagEntity,
      );

    await rolePermissionFlagRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateRolePermissionFlagAction>,
  ): Promise<void> {
    return;
  }
}
