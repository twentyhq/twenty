import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { type ActorMetadata } from 'twenty-shared/types';

import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import {
  createDirectRecordToolsFactory,
  type DirectRecordToolsDeps,
} from 'src/engine/core-modules/record-crud/tool-factory/direct-record-tools.factory';
import { PerObjectToolGeneratorService } from 'src/engine/core-modules/tool-generator/services/per-object-tool-generator.service';
import { type ToolHints } from 'src/engine/metadata-modules/ai/ai-chat-router/types/tool-hints.interface';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

@Injectable()
export class ToolService {
  private readonly directRecordToolsDeps: DirectRecordToolsDeps;

  constructor(
    private readonly perObjectToolGenerator: PerObjectToolGeneratorService,
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
