import { Module } from '@nestjs/common';

import {
  WorkspaceSchemaColumnManagerService,
  WorkspaceSchemaEnumManagerService,
  WorkspaceSchemaForeignKeyManagerService,
  WorkspaceSchemaIndexManagerService,
  WorkspaceSchemaTableManagerService,
} from './services';
import { WorkspaceSchemaManagerService } from './workspace-schema-manager.service';

@Module({
  providers: [
    WorkspaceSchemaManagerService,
    WorkspaceSchemaTableManagerService,
    WorkspaceSchemaColumnManagerService,
    WorkspaceSchemaIndexManagerService,
    WorkspaceSchemaEnumManagerService,
    WorkspaceSchemaForeignKeyManagerService,
  ],
  exports: [WorkspaceSchemaManagerService],
})
export class WorkspaceSchemaManagerModule {}
