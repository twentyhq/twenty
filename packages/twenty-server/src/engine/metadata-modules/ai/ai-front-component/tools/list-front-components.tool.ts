import { tool } from 'ai';
import { z } from 'zod';

import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';

export const createListFrontComponentsTool = ({
  frontComponentService,
  context,
}: {
  frontComponentService: Pick<FrontComponentService, 'findAll'>;
  context: Pick<
    ToolProviderContext,
    'workspaceId' | 'application' | 'authContext'
  >;
}) =>
  tool({
    description:
      'List saved frontend components and their supported widget surfaces. Saving a component and placing it on a dashboard are separate actions.',
    inputSchema: z.object({}),
    execute: async () => ({
      success: true,
      message: 'Frontend components retrieved.',
      result: (await frontComponentService.findAll(context.workspaceId))
        .filter((frontComponent) =>
          canCallerReachApplication({
            callingApplication: context.application,
            applicationId: frontComponent.applicationId,
            operation: 'read',
            workspaceCustomApplicationId:
              context.authContext?.workspace.workspaceCustomApplicationId,
          }),
        )
        .map(({ id, name, applicationId, isHeadless, widgetAvailability }) => ({
          id,
          name,
          applicationId,
          isHeadless,
          widgetAvailability,
        })),
    }),
  });
