/* eslint-disable @nx/workspace-inject-workspace-repository */
import { Injectable, Logger } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { type ToolHints } from 'src/engine/metadata-modules/ai/ai-chat-router/types/tool-hints.interface';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkflowToolWorkspaceService } from 'src/modules/workflow/workflow-tools/services/workflow-tool.workspace-service';

@Injectable()
export class ChatToolsProviderService {
  private readonly logger = new Logger(ChatToolsProviderService.name);

  constructor(
    private readonly workflowToolService: WorkflowToolWorkspaceService,
    private readonly permissionsService: PermissionsService,
  ) {}

  // Provides workflow-specific tools for the chat context
  // These tools are NOT available in the workflow executor context to prevent circular dependencies
  async getWorkflowToolsForChat(
    workspaceId: string,
    roleIds: string[],
    toolHints?: ToolHints,
  ): Promise<ToolSet> {
    const rolePermissionConfig = { intersectionOf: roleIds };

    const hasWorkflowPermission =
      await this.permissionsService.checkRolesPermissions(
        rolePermissionConfig,
        workspaceId,
        PermissionFlagType.WORKFLOWS,
      );

    if (!hasWorkflowPermission) {
      this.logger.log(
        'User does not have workflow permissions, skipping workflow tools',
      );

      return {};
    }

    const workflowTools = this.workflowToolService.generateWorkflowTools(
      workspaceId,
      rolePermissionConfig,
    );

    const recordStepTools =
      await this.workflowToolService.generateRecordStepConfiguratorTools(
        workspaceId,
        rolePermissionConfig,
        toolHints,
      );

    const allWorkflowTools = { ...workflowTools, ...recordStepTools };

    this.logger.log(
      `Generated ${Object.keys(allWorkflowTools).length} workflow tools for chat context`,
    );

    return allWorkflowTools;
  }
}
