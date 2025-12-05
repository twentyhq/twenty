/* eslint-disable @nx/workspace-inject-workspace-repository */
import { Injectable, Logger } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { type ToolHints } from 'src/engine/metadata-modules/ai/ai-chat-router/types/tool-hints.interface';
import { FieldMetadataToolsFactory } from 'src/engine/metadata-modules/field-metadata/tools/field-metadata-tools.factory';
import { ObjectMetadataToolsFactory } from 'src/engine/metadata-modules/object-metadata/tools/object-metadata-tools.factory';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkflowToolWorkspaceService } from 'src/modules/workflow/workflow-tools/services/workflow-tool.workspace-service';

@Injectable()
export class ChatToolsProviderService {
  private readonly logger = new Logger(ChatToolsProviderService.name);

  constructor(
    private readonly workflowToolService: WorkflowToolWorkspaceService,
    private readonly permissionsService: PermissionsService,
    private readonly objectMetadataToolsFactory: ObjectMetadataToolsFactory,
    private readonly fieldMetadataToolsFactory: FieldMetadataToolsFactory,
  ) {}

  // Consolidates all permission-based tools for the chat context
  async getChatTools(
    workspaceId: string,
    roleIds: string[],
    toolHints?: ToolHints,
  ): Promise<ToolSet> {
    const [workflowTools, metadataTools] = await Promise.all([
      this.getWorkflowTools(workspaceId, roleIds, toolHints),
      this.getMetadataTools(workspaceId, roleIds),
    ]);

    const allTools = { ...workflowTools, ...metadataTools };

    this.logger.log(
      `Generated ${Object.keys(allTools).length} total chat tools (workflow: ${Object.keys(workflowTools).length}, metadata: ${Object.keys(metadataTools).length})`,
    );

    return allTools;
  }

  // Provides workflow-specific tools for the chat context
  // These tools are NOT available in the workflow executor context to prevent circular dependencies
  private async getWorkflowTools(
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

    return { ...workflowTools, ...recordStepTools };
  }

  // Provides metadata tools for managing objects and fields in the data model
  private async getMetadataTools(
    workspaceId: string,
    roleIds: string[],
  ): Promise<ToolSet> {
    const rolePermissionConfig = { intersectionOf: roleIds };

    const hasDataModelPermission =
      await this.permissionsService.checkRolesPermissions(
        rolePermissionConfig,
        workspaceId,
        PermissionFlagType.DATA_MODEL,
      );

    if (!hasDataModelPermission) {
      this.logger.log(
        'User does not have data model permissions, skipping metadata tools',
      );

      return {};
    }

    const objectMetadataTools =
      this.objectMetadataToolsFactory.generateTools(workspaceId);

    const fieldMetadataTools =
      this.fieldMetadataToolsFactory.generateTools(workspaceId);

    return { ...objectMetadataTools, ...fieldMetadataTools };
  }
}
