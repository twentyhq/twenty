import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FieldMetadataOptionEntity } from 'src/engine/metadata-modules/field-metadata-option/entities/field-metadata-option.entity';
import {
  FlatDeleteFieldMetadataOptionAction,
  UniversalDeleteFieldMetadataOptionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field-metadata-option/types/workspace-migration-field-metadata-option-action.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { FieldMetadataOptionEnumSchemaService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/field-metadata-option-enum-schema.service';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteFieldMetadataOptionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'fieldMetadataOption',
) {
  constructor(
    private readonly fieldMetadataOptionEnumSchemaService: FieldMetadataOptionEnumSchemaService,
  ) {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteFieldMetadataOptionAction>,
  ): Promise<FlatDeleteFieldMetadataOptionAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteFieldMetadataOptionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const repository =
      queryRunner.manager.getRepository<FieldMetadataOptionEntity>(
        FieldMetadataOptionEntity,
      );

    await repository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    context: WorkspaceMigrationActionRunnerContext<
      FlatDeleteFieldMetadataOptionAction,
      UniversalDeleteFieldMetadataOptionAction
    >,
  ): Promise<void> {
    await this.fieldMetadataOptionEnumSchemaService.applyEnumChangeOfOptionAction(
      {
        fieldMetadataUniversalIdentifier: findFlatEntityByUniversalIdentifier({
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
