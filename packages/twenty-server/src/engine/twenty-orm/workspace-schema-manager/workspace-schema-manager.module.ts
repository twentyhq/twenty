import { Module } from '@nestjs/common';

import {
  WorkspaceSchemaColumnManager,
  WorkspaceSchemaEnumManager,
  WorkspaceSchemaForeignKeyManager,
  WorkspaceSchemaIndexManager,
  WorkspaceSchemaTableManager,
} from './services';
import { WorkspaceSchemaManager } from './workspace-schema-manager.service';

@Module({
  providers: [
    WorkspaceSchemaManager,
    WorkspaceSchemaTableManager,
    WorkspaceSchemaColumnManager,
    WorkspaceSchemaIndexManager,
    WorkspaceSchemaEnumManager,
    WorkspaceSchemaForeignKeyManager,
  ],
  exports: [WorkspaceSchemaManager],
})
export class WorkspaceSchemaManagerModule {}
