import { tool } from 'ai';
import { z } from 'zod';

import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type ApplicationCallerOperation } from 'src/engine/core-modules/application/types/application-caller-operation.type';
import { type FrontComponentService } from 'src/engine/metadata-modules/front-component/front-component.service';

export const createListFrontComponentsTool = ({
  frontComponentService,
  workspaceId,
  callingApplication,
  workspaceCustomApplicationId,
}: {
  frontComponentService: Pick<FrontComponentService, 'findAll'>;
  workspaceId: string;
  callingApplication: ApplicationCallerOperation['callingApplication'];
  workspaceCustomApplicationId: string | undefined;
}) =>
  tool({
    description:
      'List saved frontend components and their supported widget surfaces. Saving a component and placing it on a dashboard are separate actions.',
    inputSchema: z.object({}),
    execute: async () => ({
      success: true,
      message: 'Frontend components retrieved.',
      result: (await frontComponentService.findAll(workspaceId))
        .filter((frontComponent) =>
          canCallerReachApplication({
            callingApplication,
            applicationId: frontComponent.applicationId,
            operation: 'read',
            workspaceCustomApplicationId,
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
