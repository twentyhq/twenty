import { Injectable } from '@nestjs/common';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import {
  FlatUpdateObjectPermissionAction,
  UniversalUpdateObjectPermissionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object-permission/types/workspace-migration-object-permission-action.type';
import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';

@Injectable()
export class UpdateObjectPermissionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'objectPermission',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateObjectPermissionAction>,
  ): Promise<FlatUpdateObjectPermissionAction> {
    const { action, allFlatEntityMaps } = context;

    const flatObjectPermission = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatObjectPermissionMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'objectPermission',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'objectPermission',
      entityId: flatObjectPermission.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateObjectPermissionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const objectPermissionRepository =
      queryRunner.manager.getRepository<ObjectPermissionEntity>(
        ObjectPermissionEntity,
      );

    await objectPermissionRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateObjectPermissionAction>,
  ): Promise<void> {
    return;
  }
}
