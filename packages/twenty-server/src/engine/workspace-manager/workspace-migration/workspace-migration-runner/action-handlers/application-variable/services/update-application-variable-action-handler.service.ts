import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateApplicationVariableAction,
  UniversalUpdateApplicationVariableAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/application-variable/types/workspace-migration-application-variable-action.type';
import { findApplicationVariableFileIds } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/application-variable/utils/find-application-variable-file-ids.util';
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

  // Value is always encrypted regardless of isSecret, so toggling
  // isSecret does not require re-encrypting or decrypting the stored value.
  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateApplicationVariableAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId, allFlatEntityMaps } = context;
    const { entityId, update } = flatAction;
    const applicationVariableRepository =
      queryRunner.manager.getRepository<ApplicationVariableEntity>(
        ApplicationVariableEntity,
      );

    const crossesFilesBoundary = this.crossesFilesBoundary({
      flatApplicationVariable: findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: allFlatEntityMaps.flatApplicationVariableMaps,
        flatEntityId: entityId,
      }),
      update,
    });

    await applicationVariableRepository.update(
      { id: entityId, workspaceId },
      {
        ...update,
        // A file list means nothing to another type, and a scalar is no file
        ...(crossesFilesBoundary
          ? {
              value: this.secretEncryptionService.encryptVersioned(
                '' as PlaintextString,
                { workspaceId },
              ),
            }
          : {}),
      },
    );
  }

  protected override getDeferredAction({
    flatAction,
    allFlatEntityMaps,
    workspaceId,
  }: WorkspaceMigrationActionRunnerContext<FlatUpdateApplicationVariableAction>) {
    const flatApplicationVariable = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatApplicationVariableMaps,
      flatEntityId: flatAction.entityId,
    });

    if (
      !this.crossesFilesBoundary({
        flatApplicationVariable,
        update: flatAction.update,
      })
    ) {
      return undefined;
    }

    const fileIds = findApplicationVariableFileIds({
      flatApplicationVariable,
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

  private crossesFilesBoundary({
    flatApplicationVariable,
    update,
  }: {
    flatApplicationVariable: FlatApplicationVariable;
    update: FlatUpdateApplicationVariableAction['update'];
  }): boolean {
    const nextType = update.type;

    return (
      isDefined(nextType) &&
      nextType !== flatApplicationVariable.type &&
      (nextType === FieldMetadataType.FILES ||
        flatApplicationVariable.type === FieldMetadataType.FILES)
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateApplicationVariableAction>,
  ): Promise<void> {
    return;
  }
}
