import { Injectable } from '@nestjs/common';

import { WorkspaceSchemaColumnManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-column-manager.service';
import { WorkspaceSchemaEnumManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-enum-manager.service';
import { WorkspaceSchemaForeignKeyManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-foreign-key-manager.service';
import { WorkspaceSchemaIndexManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-index-manager.service';
import { WorkspaceSchemaTableRebuildManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-table-rebuild-manager.service';
import { WorkspaceSchemaTableManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/services/workspace-schema-table-manager.service';

@Injectable()
export class WorkspaceSchemaManagerService {
  public readonly tableManager: WorkspaceSchemaTableManagerService;
  public readonly tableRebuildManager: WorkspaceSchemaTableRebuildManagerService;
  public readonly columnManager: WorkspaceSchemaColumnManagerService;
  public readonly indexManager: WorkspaceSchemaIndexManagerService;
  public readonly enumManager: WorkspaceSchemaEnumManagerService;
  public readonly foreignKeyManager: WorkspaceSchemaForeignKeyManagerService;

  constructor(
    workspaceSchemaTableManager: WorkspaceSchemaTableManagerService,
    workspaceSchemaColumnManager: WorkspaceSchemaColumnManagerService,
    workspaceSchemaIndexManager: WorkspaceSchemaIndexManagerService,
    workspaceSchemaEnumManager: WorkspaceSchemaEnumManagerService,
    workspaceSchemaForeignKeyManager: WorkspaceSchemaForeignKeyManagerService,
    workspaceSchemaTableRebuildManager: WorkspaceSchemaTableRebuildManagerService,
  ) {
    this.tableManager = workspaceSchemaTableManager;
    this.columnManager = workspaceSchemaColumnManager;
    this.indexManager = workspaceSchemaIndexManager;
    this.enumManager = workspaceSchemaEnumManager;
    this.foreignKeyManager = workspaceSchemaForeignKeyManager;
    this.tableRebuildManager = workspaceSchemaTableRebuildManager;
  }
}
