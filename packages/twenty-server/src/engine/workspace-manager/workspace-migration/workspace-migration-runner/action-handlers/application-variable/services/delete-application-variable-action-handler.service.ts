import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import {
  FlatDeleteApplicationVariableAction,
  UniversalDeleteApplicationVariableAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/application-variable/types/workspace-migration-application-variable-action.type';
import { findApplicationVariableFileIds } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/application-variable/utils/find-application-variable-file-ids.util';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteApplicationVariableActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'applicationVariable',
) {
  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteApplicationVariableAction>,
  ): Promise<FlatDeleteApplicationVariableAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteApplicationVariableAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const applicationVariableRepository =
      queryRunner.manager.getRepository<ApplicationVariableEntity>(
        ApplicationVariableEntity,
      );

    await applicationVariableRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteApplicationVariableAction>,
  ): Promise<void> {
    return;
  }

  protected override getDeferredAction({
    flatAction,
    allFlatEntityMaps,
    workspaceId,
  }: WorkspaceMigrationActionRunnerContext<FlatDeleteApplicationVariableAction>) {
    const fileIds = findApplicationVariableFileIds({
      flatApplicationVariable: findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: allFlatEntityMaps.flatApplicationVariableMaps,
        flatEntityId: flatAction.entityId,
      }),
      secretEncryptionService: this.secretEncryptionService,
      workspaceId,
    });

    return fileIds.length > 0
      ? {
          name: 'delete_applicationVariableFiles' as const,
          payload: { fileIds },
        }
      : undefined;
  }
}
