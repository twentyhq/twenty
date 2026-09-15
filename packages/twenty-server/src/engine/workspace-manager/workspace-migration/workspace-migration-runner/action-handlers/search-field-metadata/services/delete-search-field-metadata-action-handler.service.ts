import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import {
  FlatDeleteSearchFieldMetadataAction,
  UniversalDeleteSearchFieldMetadataAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/search-field-metadata/types/workspace-migration-search-field-metadata-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteSearchFieldMetadataActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'searchFieldMetadata',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteSearchFieldMetadataAction>,
  ): Promise<FlatDeleteSearchFieldMetadataAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteSearchFieldMetadataAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const searchFieldMetadataRepository =
      queryRunner.manager.getRepository<SearchFieldMetadataEntity>(
        SearchFieldMetadataEntity,
      );

    await searchFieldMetadataRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteSearchFieldMetadataAction>,
  ): Promise<void> {
    return;
  }
}
