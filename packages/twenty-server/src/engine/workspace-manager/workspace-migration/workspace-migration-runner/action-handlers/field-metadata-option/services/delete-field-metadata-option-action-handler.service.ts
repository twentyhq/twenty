import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FieldMetadataOptionEntity } from 'src/engine/metadata-modules/field-metadata-option/entities/field-metadata-option.entity';
import {
  FlatDeleteFieldMetadataOptionAction,
  UniversalDeleteFieldMetadataOptionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field-metadata-option/types/workspace-migration-field-metadata-option-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteFieldMetadataOptionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'fieldMetadataOption',
) {
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
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteFieldMetadataOptionAction>,
  ): Promise<void> {
    return;
  }
}
