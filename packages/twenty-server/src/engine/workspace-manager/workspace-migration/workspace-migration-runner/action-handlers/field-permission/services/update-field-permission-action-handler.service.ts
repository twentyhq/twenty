import { Injectable } from '@nestjs/common';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import {
  FlatUpdateFieldPermissionAction,
  UniversalUpdateFieldPermissionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field-permission/types/workspace-migration-field-permission-action.type';
import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';

@Injectable()
export class UpdateFieldPermissionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'fieldPermission',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateFieldPermissionAction>,
  ): Promise<FlatUpdateFieldPermissionAction> {
    const { action, allFlatEntityMaps } = context;

    const flatFieldPermission = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatFieldPermissionMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'fieldPermission',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'fieldPermission',
      entityId: flatFieldPermission.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateFieldPermissionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const fieldPermissionRepository =
      queryRunner.manager.getRepository<FieldPermissionEntity>(
        FieldPermissionEntity,
      );

    await fieldPermissionRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateFieldPermissionAction>,
  ): Promise<void> {
    return;
  }
}
