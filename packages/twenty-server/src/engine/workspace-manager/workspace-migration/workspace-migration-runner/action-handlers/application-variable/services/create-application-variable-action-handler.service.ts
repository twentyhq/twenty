import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import {
  FlatCreateApplicationVariableAction,
  UniversalCreateApplicationVariableAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/application-variable/types/workspace-migration-application-variable-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateApplicationVariableActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'applicationVariable',
) {
  constructor(
    private readonly secretEncryptionService: SecretEncryptionService,
  ) {
    super();
  }

  override async transpileUniversalActionToFlatAction({
    action,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreateApplicationVariableAction>): Promise<FlatCreateApplicationVariableAction> {
    const emptyUniversalForeignKeyAggregators =
      getUniversalFlatEntityEmptyForeignKeyAggregators({
        metadataName: 'applicationVariable',
      });

    const { scope, defaultValue } = action.flatEntity;

    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        // A user variable's values belong to each member, so it has no workspace value
        value:
          scope === 'USER'
            ? null
            : this.secretEncryptionService.encryptVersioned(
                (defaultValue ?? '') as PlaintextString,
                { workspaceId },
              ),
        applicationId: flatApplication.id,
        id: action.id ?? v4(),
        workspaceId,
        ...emptyUniversalForeignKeyAggregators,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateApplicationVariableAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { flatEntity } = flatAction;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [flatEntity],
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateApplicationVariableAction>,
  ): Promise<void> {
    return;
  }
}
