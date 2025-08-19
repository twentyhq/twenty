import { Module } from '@nestjs/common';

import { WorkspaceSchemaFieldCreateActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-field-action-runner/actions/workspace-schema-field-create-action-runner.service';
import { WorkspaceSchemaFieldDeleteActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-field-action-runner/actions/workspace-schema-field-delete-action-runner.service';
import { WorkspaceSchemaFieldUpdateActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-field-action-runner/actions/workspace-schema-field-update-action-runner.service';
import { WorkspaceSchemaFieldActionRunnerService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/workspace-schema-field-action-runner/workspace-schema-field-action-runner.service';

@Module({
  providers: [
    WorkspaceSchemaFieldCreateActionRunnerService,
    WorkspaceSchemaFieldDeleteActionRunnerService,
    WorkspaceSchemaFieldUpdateActionRunnerService,
    WorkspaceSchemaFieldActionRunnerService,
  ],
  exports: [WorkspaceSchemaFieldActionRunnerService],
})
export class WorkspaceSchemaFieldActionRunnerModule {}
