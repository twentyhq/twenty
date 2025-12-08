import { Injectable, Logger } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { ToolProviderService } from 'src/engine/core-modules/tool-provider/services/tool-provider.service';
import { type ToolHints } from 'src/engine/metadata-modules/ai/ai-chat-router/types/tool-hints.interface';

@Injectable()
export class ChatToolsProviderService {
  private readonly logger = new Logger(ChatToolsProviderService.name);

  constructor(private readonly toolProvider: ToolProviderService) {}

  // Provides additional tools for the chat context (WORKFLOW and METADATA)
  // These tools are NOT available in the workflow executor context to prevent circular dependencies
  // Base tools (DATABASE_CRUD, ACTION) are provided by AgentToolGeneratorService
  async getChatTools(
    workspaceId: string,
    roleIds: string[],
    toolHints?: ToolHints,
  ): Promise<ToolSet> {
    const tools = await this.toolProvider.getTools({
      workspaceId,
      categories: [ToolCategory.WORKFLOW, ToolCategory.METADATA],
      rolePermissionConfig: { intersectionOf: roleIds },
      toolHints,
      wrapWithErrorContext: false,
    });

    this.logger.log(
      `Generated ${Object.keys(tools).length} additional chat tools (workflow + metadata)`,
    );

    return tools;
  }
}
