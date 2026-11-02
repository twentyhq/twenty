import { type DiscoveryService } from '@nestjs/core';

import { type FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { DefinedToolRegistryService } from 'src/engine/core-modules/tool-provider/services/defined-tool-registry.service';
import { type PermissionsService } from 'src/engine/permissions/permissions.service';
import { FindCampaignSuppressionsTool } from 'src/modules/emailing/tools/find-campaign-suppressions.tool';
import { PreviewCampaignSendTool } from 'src/modules/emailing/tools/preview-campaign-send.tool';
import { SendCampaignTestTool } from 'src/modules/emailing/tools/send-campaign-test.tool';
import { SendCampaignTool } from 'src/modules/emailing/tools/send-campaign.tool';

const CAMPAIGN_TOOLS: BaseTool[] = [
  new PreviewCampaignSendTool({} as never, {} as never),
  new SendCampaignTestTool({} as never, {} as never),
  new SendCampaignTool({} as never, {} as never),
  new FindCampaignSuppressionsTool({} as never, {} as never),
];

const memberContext: ToolProviderContext = {
  workspaceId: 'workspace-id',
  userWorkspaceId: 'user-workspace-id',
  rolePermissionConfig: {
    intersectionOf: { userWorkspaceRoleId: 'member-role-id' },
  },
};

const listCampaignToolNames = async (context: ToolProviderContext) => {
  const definedToolRegistryService = new DefinedToolRegistryService(
    {
      getProviders: () =>
        CAMPAIGN_TOOLS.map((tool) => ({
          instance: tool,
          metatype: tool.constructor,
        })),
    } as unknown as DiscoveryService,
    {
      checkRolesPermissions: jest.fn().mockResolvedValue(true),
    } as unknown as PermissionsService,
    {
      getWorkspaceFeatureFlagsMap: jest.fn().mockResolvedValue({}),
    } as unknown as FeatureFlagService,
  );

  definedToolRegistryService.onModuleInit();

  return (
    await definedToolRegistryService.getAvailableDescriptors(context, {
      includeSchemas: false,
    })
  ).map(({ name }) => name);
};

// these tools send and read as the member or the system, so an AI run's scope could not narrow them
describe('campaign tools under a permission scope', () => {
  it('are offered to a member granted the workspace flag', async () => {
    expect(await listCampaignToolNames(memberContext)).toEqual([
      'preview_campaign_send',
      'send_campaign_test',
      'send_campaign',
      'find_campaign_suppressions',
    ]);
  });

  it('are withheld from an AI run narrowed by a scope, even one granting the flag', async () => {
    expect(
      await listCampaignToolNames({
        ...memberContext,
        rolePermissionConfig: {
          intersectionOf: { userWorkspaceRoleId: 'member-role-id' },
          scope: { objectsPermissions: {}, permissionFlags: {} },
        },
      }),
    ).toEqual([]);
  });
});
