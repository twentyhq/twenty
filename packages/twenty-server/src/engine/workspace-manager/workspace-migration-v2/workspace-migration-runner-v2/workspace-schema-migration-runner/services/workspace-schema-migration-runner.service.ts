import { Injectable } from '@nestjs/common';

import { type WorkspaceMigrationRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-runner-args.type';
import { WorkspaceSchemaActionRegistryService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/registry/workspace-schema-action-registry.service';

@Injectable()
export class WorkspaceSchemaMigrationRunnerService {
  constructor(
    private readonly actionRegistry: WorkspaceSchemaActionRegistryService,
  ) {}

  async runWorkspaceSchemaMigration({
    action,
    queryRunner,
    flatObjectMetadataMaps,
  }: WorkspaceMigrationRunnerArgs): Promise<void> {
    await this.actionRegistry.executeAction(action.type, {
      action,
      queryRunner,
      flatObjectMetadataMaps,
    });
  }
}
