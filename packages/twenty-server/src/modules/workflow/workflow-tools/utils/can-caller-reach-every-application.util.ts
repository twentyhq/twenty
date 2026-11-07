import { getReachableApplications } from 'src/engine/core-modules/application/utils/get-reachable-applications.util';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

// Workspace workflows can call any application, so a caller limited to its own application must stay out of them
export const canCallerReachEveryApplication = ({
  application,
  authContext,
}: Pick<ToolProviderContext, 'application' | 'authContext'>): boolean =>
  getReachableApplications({
    callingApplication: application,
    operation: 'trigger',
    workspaceCustomApplicationId:
      authContext?.workspace.workspaceCustomApplicationId,
  }).type === 'all';
