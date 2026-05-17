import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
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
  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {
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

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateApplicationVariableAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;
    const applicationVariableRepository =
      queryRunner.manager.getRepository<ApplicationVariableEntity>(
        ApplicationVariableEntity,
      );

    const existing = await applicationVariableRepository.findOne({
      where: { id: entityId, workspaceId },
    });

    if (
      update.isSecret !== undefined &&
      update.isSecret &&
      existing &&
      !existing.isSecret
    ) {
      (update as Record<string, unknown>).value =
        this.secretEncryptionService.encryptVersioned(existing.value, {
          workspaceId,
        });
    }

    if (
      update.isSecret !== undefined &&
      !update.isSecret &&
      existing &&
      existing.isSecret
    ) {
      (update as Record<string, unknown>).value =
        this.secretEncryptionService.decryptVersioned(existing.value, {
          workspaceId,
        });
    }

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
