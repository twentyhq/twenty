import {
  type WorkflowToolContext,
  type WorkflowToolDependencies,
} from 'src/modules/workflow/workflow-tools/types/workflow-tool-dependencies.type';

import { createGetLogicFunctionSourceTool } from '../get-logic-function-source.tool';

const WORKSPACE_ID = '20202020-aaaa-4d02-bf25-6aeccf7ea419';
const LOGIC_FUNCTION_ID = '20202020-bbbb-4d02-bf25-6aeccf7ea419';

const buildDeps = (getSourceCode: jest.Mock) =>
  ({
    logicFunctionFromSourceService: { getSourceCode },
  }) as unknown as Pick<
    WorkflowToolDependencies,
    'logicFunctionFromSourceService'
  >;

const buildContext = () =>
  ({ workspaceId: WORKSPACE_ID }) as unknown as WorkflowToolContext;

describe('get_logic_function_source tool', () => {
  it('returns the source code from the service', async () => {
    const source = 'export const main = async () => ({ ok: true });';
    const getSourceCode = jest.fn().mockResolvedValue(source);

    const tool = createGetLogicFunctionSourceTool(
      buildDeps(getSourceCode),
      buildContext(),
    );

    const result = await tool.execute({ logicFunctionId: LOGIC_FUNCTION_ID });

    expect(getSourceCode).toHaveBeenCalledWith({
      id: LOGIC_FUNCTION_ID,
      workspaceId: WORKSPACE_ID,
    });
    expect(result).toEqual({
      success: true,
      logicFunctionId: LOGIC_FUNCTION_ID,
      sourceHandlerCode: source,
    });
  });

  it('returns a failure result when the service throws', async () => {
    const getSourceCode = jest
      .fn()
      .mockRejectedValue(new Error('Logic function not found'));

    const tool = createGetLogicFunctionSourceTool(
      buildDeps(getSourceCode),
      buildContext(),
    );

    const result = await tool.execute({ logicFunctionId: LOGIC_FUNCTION_ID });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Logic function not found');
  });
});
