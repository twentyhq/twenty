import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { type PermissionFlagType } from 'twenty-shared/constants';

import { ToolRegistryService } from 'src/engine/core-modules/tool/services/tool-registry.service';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

@Injectable()
export class ToolAdapterService {
  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async getTools(
    workspaceId: string,
    rolePermissionConfig?: RolePermissionConfig,
  ): Promise<ToolSet> {
    const tools: ToolSet = {};

    for (const toolType of this.toolRegistry.getAllToolTypes()) {
      const tool = this.toolRegistry.getTool(toolType);

      if (!tool.flag) {
        tools[toolType.toLowerCase()] = this.createToolSet(tool, workspaceId);
      } else if (rolePermissionConfig) {
        const hasPermission = await this.permissionsService.hasToolPermission(
          rolePermissionConfig,
          workspaceId,
          tool.flag as PermissionFlagType,
        );

        if (hasPermission) {
          tools[toolType.toLowerCase()] = this.createToolSet(tool, workspaceId);
        }
      }
    }

    return tools;
  }

  private createToolSet(tool: Tool, workspaceId: string) {
    return {
      description: tool.description,
      inputSchema: tool.inputSchema,
      execute: async (parameters: { input: ToolInput }) =>
        tool.execute(parameters.input, workspaceId),
    };
  }
}
