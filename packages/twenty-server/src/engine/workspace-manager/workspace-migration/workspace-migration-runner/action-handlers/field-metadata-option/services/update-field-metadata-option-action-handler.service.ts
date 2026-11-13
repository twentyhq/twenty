import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { FieldMetadataOptionEntity } from 'src/engine/metadata-modules/field-metadata-option/entities/field-metadata-option.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateFieldMetadataOptionAction,
  UniversalUpdateFieldMetadataOptionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field-metadata-option/types/workspace-migration-field-metadata-option-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateFieldMetadataOptionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'fieldMetadataOption',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalUpdateFieldMetadataOptionAction>,
  ): Promise<FlatUpdateFieldMetadataOptionAction> {
    const { action, allFlatEntityMaps } = context;

    const flatFieldMetadataOption = findFlatEntityByUniversalIdentifierOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatFieldMetadataOptionMaps,
      universalIdentifier: action.universalIdentifier,
    });

    const update = resolveUniversalUpdateRelationIdentifiersToIds({
      metadataName: 'fieldMetadataOption',
      universalUpdate: action.update,
      allFlatEntityMaps,
    });

    return {
      type: 'update',
      metadataName: 'fieldMetadataOption',
      entityId: flatFieldMetadataOption.id,
      update,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateFieldMetadataOptionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const repository =
      queryRunner.manager.getRepository<FieldMetadataOptionEntity>(
        FieldMetadataOptionEntity,
      );

    await repository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateFieldMetadataOptionAction>,
  ): Promise<void> {
    return;
  }
}
