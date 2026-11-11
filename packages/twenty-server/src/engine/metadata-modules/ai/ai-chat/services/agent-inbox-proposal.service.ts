import { Injectable } from '@nestjs/common';

import { type ProposeToolCallToolInput } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { resolveApplicationGrantRoleId } from 'src/engine/core-modules/application/application-grant-role/utils/resolve-application-grant-role-id.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { workspaceAuthContextStorage } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { type ProposedToolCallResolution } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/proposed-tool-call-resolution.type';
import { isEmailToolName } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/is-email-tool-name.util';
import { resolveEmailToolCallProposal } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-email-tool-call-proposal.util';
import { resolveProposedToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-proposed-tool-call.util';

// An app proposes only calls it could run itself, checked with its own role; once
// approved, the call runs with the member's access. An email needs none of the app's tools.
@Injectable()
export class AgentInboxProposalService {
  constructor(
    private readonly toolRegistryService: ToolRegistryService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async resolveApplicationProposal({
    workspace,
    application,
    input,
  }: {
    workspace: FlatWorkspace;
    application: FlatApplication;
    input: ProposeToolCallToolInput;
  }): Promise<ProposedToolCallResolution> {
    if (isEmailToolName(input.toolName)) {
      return resolveEmailToolCallProposal(input);
    }

    const authContext = workspaceAuthContextStorage.getStore();
    const { flatRoleTargetByApplicationIdMaps } =
      await this.workspaceCacheService.getOrRecompute(workspace.id, [
        'flatRoleTargetByApplicationIdMaps',
      ]);
    const grantRoleId = resolveApplicationGrantRoleId({
      flatApplication: application,
      workspaceId: workspace.id,
      workspaceCustomApplicationId: workspace.workspaceCustomApplicationId,
      flatRoleTargetByApplicationIdMaps,
    });

    if (!isDefined(authContext) || !isDefined(grantRoleId)) {
      return {
        error: `The application needs a default role to propose "${input.toolName}".`,
      };
    }

    const toolContext: ToolContext = {
      workspaceId: workspace.id,
      authContext,
      application,
    };

    return resolveProposedToolCall({
      input,
      findTool: (toolName) =>
        this.toolRegistryService.findCatalogEntry(toolName, toolContext),
      executeTool: ({ toolName, args }) =>
        this.toolRegistryService.resolveAndExecute(toolName, args, toolContext),
    });
  }
}
