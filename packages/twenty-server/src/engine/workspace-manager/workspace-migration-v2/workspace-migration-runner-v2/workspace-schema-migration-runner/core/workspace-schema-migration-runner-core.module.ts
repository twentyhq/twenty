import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { WorkspaceSchemaActionRegistryService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/core/registry/workspace-schema-action-registry.service';

@Module({
  imports: [DiscoveryModule],
  providers: [WorkspaceSchemaActionRegistryService],
  exports: [WorkspaceSchemaActionRegistryService],
})
export class WorkspaceSchemaMigrationRunnerCoreModule {}
