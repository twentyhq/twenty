import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { FieldMetadataOptionEntity } from 'src/engine/metadata-modules/field-metadata-option/entities/field-metadata-option.entity';
import { resolveUniversalUpdateRelationIdentifiersToIds } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/resolve-universal-update-relation-identifiers-to-ids.util';
import {
  FlatUpdateFieldMetadataOptionAction,
  UniversalUpdateFieldMetadataOptionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field-metadata-option/types/workspace-migration-field-metadata-option-action.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { FieldMetadataOptionEnumSchemaService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/field-metadata-option-enum-schema.service';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateFieldMetadataOptionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'fieldMetadataOption',
) {
  constructor(
    private readonly fieldMetadataOptionEnumSchemaService: FieldMetadataOptionEnumSchemaService,
  ) {
    super();
  }

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
    context: WorkspaceMigrationActionRunnerContext<
      FlatUpdateFieldMetadataOptionAction,
      UniversalUpdateFieldMetadataOptionAction
    >,
  ): Promise<void> {
    await this.fieldMetadataOptionEnumSchemaService.applyEnumChangeOfOptionAction(
      {
        fieldMetadataUniversalIdentifier:
          findFlatEntityByUniversalIdentifier({
          universalIdentifier: context.action.universalIdentifier,
          flatEntityMaps: context.allFlatEntityMaps.flatFieldMetadataOptionMaps,
        })?.fieldMetadataUniversalIdentifier,
        fieldMetadataOptionEnumChangeTracker:
          context.fieldMetadataOptionEnumChangeTracker,
        allFlatEntityMaps: context.allFlatEntityMaps,
        queryRunner: context.queryRunner,
        workspaceId: context.workspaceId,
      },
    );
  }
}
