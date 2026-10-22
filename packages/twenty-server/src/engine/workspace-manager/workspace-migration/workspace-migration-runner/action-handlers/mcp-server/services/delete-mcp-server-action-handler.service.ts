import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { McpServerEntity } from 'src/engine/metadata-modules/mcp-server/entities/mcp-server.entity';
import {
  FlatDeleteMcpServerAction,
  UniversalDeleteMcpServerAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/mcp-server/types/workspace-migration-mcp-server-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteMcpServerActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'mcpServer',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteMcpServerAction>,
  ): Promise<FlatDeleteMcpServerAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteMcpServerAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const mcpServerRepository =
      queryRunner.manager.getRepository<McpServerEntity>(McpServerEntity);

    await mcpServerRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteMcpServerAction>,
  ): Promise<void> {
    return;
  }
}
