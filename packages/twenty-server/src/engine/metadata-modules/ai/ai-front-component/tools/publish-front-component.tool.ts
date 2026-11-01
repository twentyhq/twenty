import { tool } from 'ai';
import { z } from 'zod';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type AiFrontComponentService } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.service';
import { frontComponentDraftIdSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-draft-id.schema';

export const createPublishFrontComponentTool = ({
  aiFrontComponentService,
  context,
}: {
  aiFrontComponentService: Pick<AiFrontComponentService, 'publish'>;
  context: Pick<
    ToolProviderContext,
    | 'workspaceId'
    | 'userWorkspaceId'
    | 'threadId'
    | 'authContext'
    | 'approvedToolName'
    | 'rolePermissionConfig'
  >;
}) =>
  tool({
    description:
      'Save the exact preview revision to the Workspace app. Use propose_tool_call with the draftId and checksum returned by the preview, and wait for explicit approval. Never call this tool directly. Saving makes the component available in the widget picker; it does not place a widget. Saved components use the normal app SDK and permissions.',
    inputSchema: frontComponentDraftIdSchema.extend({
      checksum: z.string().regex(/^[a-f0-9]{64}$/),
    }),
    execute: async ({ draftId, checksum }) => ({
      success: true,
      message: 'Component saved to the Workspace app.',
      result: await aiFrontComponentService.publish({
        draftId,
        checksum,
        context,
      }),
    }),
  });
