import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { LogicFunctionToolProvider } from 'src/engine/core-modules/tool-provider/providers/logic-function-tool.provider';
import { WorkflowToolProvider } from 'src/engine/core-modules/tool-provider/providers/workflow-tool.provider';
import { LOGIC_FUNCTION_OPERATIONS } from 'src/engine/metadata-modules/logic-function/constants/logic-function-operations.constant';
import { WorkflowToolWorkspaceService } from 'src/modules/workflow/workflow-tools/services/workflow-tool.workspace-service';

const buildWorkflowToolNames = () => {
  const workflowToolService =
    new (WorkflowToolWorkspaceService as unknown as new (
      ...args: unknown[]
    ) => WorkflowToolWorkspaceService)(
      ...Array.from({ length: 12 }, () => ({})),
    );

  return Object.keys(
    workflowToolService.generateWorkflowTools({
      workspaceId: 'workspace-id',
      rolePermissionConfig: { shouldBypassPermissionChecks: true },
    } satisfies Pick<
      ToolProviderContext,
      'workspaceId' | 'rolePermissionConfig'
    >),
  );
};

describe('logic function operation policies', () => {
  it('should map every workflow tool acting on logic functions to a policy', () => {
    const workflowToolProvider = new WorkflowToolProvider(
      null,
      {} as never,
      {} as never,
    );

    const logicFunctionToolNames = buildWorkflowToolNames().filter((toolName) =>
      toolName.includes('logic_function'),
    );

    expect(logicFunctionToolNames.sort()).toEqual([
      'get_logic_function_source',
      'list_logic_function_tools',
      'update_logic_function_source',
    ]);

    for (const toolName of logicFunctionToolNames) {
      expect(workflowToolProvider.getToolPolicy(toolName)).toBeDefined();
    }

    expect(
      workflowToolProvider.getToolPolicy('get_logic_function_source'),
    ).toBe(LOGIC_FUNCTION_OPERATIONS.readSource);
    expect(
      workflowToolProvider.getToolPolicy('update_logic_function_source'),
    ).toBe(LOGIC_FUNCTION_OPERATIONS.updateSource);
    expect(
      workflowToolProvider.getToolPolicy('list_logic_function_tools'),
    ).toBe(LOGIC_FUNCTION_OPERATIONS.list);
  });

  it('should map the tool generated for each logic function to executeAsTool', () => {
    const logicFunctionToolProvider = new LogicFunctionToolProvider(
      {} as never,
      {} as never,
    );

    expect(logicFunctionToolProvider.getToolPolicy('app_any_function')).toBe(
      LOGIC_FUNCTION_OPERATIONS.executeAsTool,
    );
  });

  it('should keep applications out of creating and deleting logic functions', () => {
    expect(LOGIC_FUNCTION_OPERATIONS.create.authPrincipal.application).toBe(
      false,
    );
    expect(LOGIC_FUNCTION_OPERATIONS.delete.authPrincipal.application).toBe(
      false,
    );
  });
});
