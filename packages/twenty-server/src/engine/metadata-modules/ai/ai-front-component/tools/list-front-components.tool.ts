import { tool } from 'ai';
import { z } from 'zod';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';

export const createListFrontComponentsTool = (
  frontComponentService: FrontComponentService,
  context: ToolProviderContext,
) =>
  tool({
    description:
      'List saved frontend components and their supported widget surfaces. Saving a component and placing it on a dashboard are separate actions.',
    inputSchema: z.object({}),
    execute: async () => ({
      success: true,
      message: 'Frontend components retrieved.',
      result: (await frontComponentService.findAll(context.workspaceId)).map(
        ({ id, name, applicationId, isHeadless, widgetAvailability }) => ({
          id,
          name,
          applicationId,
          isHeadless,
          widgetAvailability,
        }),
      ),
    }),
  });
