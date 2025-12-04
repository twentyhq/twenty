import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { type ActorMetadata } from 'twenty-shared/types';

import {
  createDirectRecordToolsFactory,
  type DirectRecordToolsDeps,
} from 'src/engine/core-modules/record-crud/tool-factory/direct-record-tools.factory';
import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { PerObjectToolGeneratorService } from 'src/engine/core-modules/tool-generator/services/per-object-tool-generator.service';
import { type ToolHints } from 'src/engine/metadata-modules/ai/ai-chat-router/types/tool-hints.interface';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

@Injectable()
export class ToolService {
  private readonly directRecordToolsDeps: DirectRecordToolsDeps;

  constructor(
    private readonly perObjectToolGenerator: PerObjectToolGeneratorService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    createRecordService: CreateRecordService,
    updateRecordService: UpdateRecordService,
    deleteRecordService: DeleteRecordService,
    findRecordsService: FindRecordsService,
  ) {
    this.directRecordToolsDeps = {
      createRecordService,
      updateRecordService,
      deleteRecordService,
      findRecordsService,
      twentyORMGlobalManager,
    };
  }

  // Generates AI tools for database operations based on workspace objects and permissions
  async listTools(
    rolePermissionConfig: RolePermissionConfig,
    workspaceId: string,
    actorContext?: ActorMetadata,
    toolHints?: ToolHints,
  ): Promise<ToolSet> {
    const directRecordToolsFactory = createDirectRecordToolsFactory(
      this.directRecordToolsDeps,
    );

    return this.perObjectToolGenerator.generate(
      {
        workspaceId,
        rolePermissionConfig,
        actorContext,
      },
      [directRecordToolsFactory],
      toolHints,
    );
  }
}
