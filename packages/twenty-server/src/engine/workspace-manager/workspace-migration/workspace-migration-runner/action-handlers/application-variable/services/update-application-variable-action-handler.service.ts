import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateApplicationVariableAction,
  UniversalUpdateApplicationVariableAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/application-variable/types/workspace-migration-application-variable-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateApplicationVariableActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'applicationVariable',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateApplicationVariableAction>,
  ): Promise<FlatUpdateApplicationVariableAction> {
    const { action, allFlatEntityMaps } = context;

    const flatApplicationVariable = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatApplicationVariableMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'applicationVariable',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'applicationVariable',
      entityId: flatApplicationVariable.id,
      update,
    };
  }

  // Value is always encrypted regardless of isSecret, so toggling
  // isSecret does not require re-encrypting or decrypting the stored value.
  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateApplicationVariableAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;
    const applicationVariableRepository =
      queryRunner.manager.getRepository<ApplicationVariableEntity>(
        ApplicationVariableEntity,
      );

    await applicationVariableRepository.update(
      { id: entityId, workspaceId },
      update,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateApplicationVariableAction>,
  ): Promise<void> {
    return;
  }
}
