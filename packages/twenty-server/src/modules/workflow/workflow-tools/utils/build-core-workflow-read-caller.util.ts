import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type CoreWorkflowReadCaller } from 'src/engine/core-modules/workflow/types/core-workflow-read-caller.type';

export const buildCoreWorkflowReadCaller = ({
  application,
  authContext,
}: Pick<
  ToolProviderContext,
  'application' | 'authContext'
>): CoreWorkflowReadCaller => ({
  callerApplication: application,
  workspaceCustomApplicationId:
    authContext?.workspace.workspaceCustomApplicationId,
});
