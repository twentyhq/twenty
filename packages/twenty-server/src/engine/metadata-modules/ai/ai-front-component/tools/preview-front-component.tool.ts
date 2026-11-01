import { tool } from 'ai';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type AiFrontComponentService } from 'src/engine/metadata-modules/ai/ai-front-component/ai-front-component.service';
import { FRONT_COMPONENT_UI_INSTRUCTIONS } from 'src/engine/metadata-modules/ai/ai-front-component/constants/front-component-ui-instructions.constant';
import { frontComponentDraftSchema } from 'src/engine/metadata-modules/ai/ai-front-component/schemas/front-component-draft.schema';

export const createPreviewFrontComponentTool = ({
  aiFrontComponentService,
  context,
}: {
  aiFrontComponentService: Pick<AiFrontComponentService, 'createDraft'>;
  context: Pick<
    ToolProviderContext,
    | 'workspaceId'
    | 'userWorkspaceId'
    | 'threadId'
    | 'authContext'
    | 'rolePermissionConfig'
  >;
}) =>
  tool({
    description:
      'Create or revise a frontend component preview with sample data. Inspect object metadata first. Choose one surface, DASHBOARD or RECORD_PAGE. Pass previousDraftId to revise a draft. Returns draftId and checksum after compilation, without saving the component or confirming browser rendering. Use inspect_front_component to read reported browser errors.' +
      FRONT_COMPONENT_UI_INSTRUCTIONS,
    inputSchema: frontComponentDraftSchema,
    execute: async (draftInput) => ({
      success: true,
      message: 'Component preview built with sample data.',
      result: await aiFrontComponentService.createDraft({
        draftInput,
        context,
      }),
    }),
  });
