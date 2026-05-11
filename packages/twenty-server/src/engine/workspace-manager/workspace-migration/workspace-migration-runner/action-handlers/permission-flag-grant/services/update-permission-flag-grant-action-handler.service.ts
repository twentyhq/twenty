import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { PermissionFlagGrantEntity } from 'src/engine/metadata-modules/permission-flag-grant/permission-flag-grant.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdatePermissionFlagGrantAction,
  UniversalUpdatePermissionFlagGrantAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/permission-flag-grant/types/workspace-migration-permission-flag-grant-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdatePermissionFlagGrantActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'permissionFlagGrant',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdatePermissionFlagGrantAction>,
  ): Promise<FlatUpdatePermissionFlagGrantAction> {
    const { action, allFlatEntityMaps } = context;

    const flatPermissionFlagGrant = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatPermissionFlagGrantMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'permissionFlagGrant',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'permissionFlagGrant',
      entityId: flatPermissionFlagGrant.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdatePermissionFlagGrantAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const permissionFlagGrantRepository =
      queryRunner.manager.getRepository<PermissionFlagGrantEntity>(
        PermissionFlagGrantEntity,
      );

    await permissionFlagGrantRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdatePermissionFlagGrantAction>,
  ): Promise<void> {
    return;
  }
}
