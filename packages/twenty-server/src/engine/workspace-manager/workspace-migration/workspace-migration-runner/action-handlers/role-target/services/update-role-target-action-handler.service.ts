import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateRoleTargetAction,
  UniversalUpdateRoleTargetAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role-target/types/workspace-migration-role-target-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateRoleTargetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'roleTarget',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateRoleTargetAction>,
  ): Promise<FlatUpdateRoleTargetAction> {
    const { action, allFlatEntityMaps } = context;

    const flatRoleTarget = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatRoleTargetMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'roleTarget',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'roleTarget',
      entityId: flatRoleTarget.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateRoleTargetAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const roleTargetRepository =
      queryRunner.manager.getRepository<RoleTargetEntity>(RoleTargetEntity);

    await roleTargetRepository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateRoleTargetAction>,
  ): Promise<void> {
    return;
  }
}
