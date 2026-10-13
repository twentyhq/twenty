import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { ToolCategory } from 'twenty-shared/ai';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { type ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';

export const captureCodeInterpreterSandboxToken = async ({
  authContext,
  roleId,
}: {
  authContext: WorkspaceAuthContext;
  roleId: string;
}): Promise<string | undefined> => {
  const executeSpy = jest
    .spyOn(
      getAppProviderByClassName<CodeInterpreterService>(
        'CodeInterpreterService',
      ),
      'execute',
    )
    .mockResolvedValue({ exitCode: 0, stdout: '', stderr: '', files: [] });

  try {
    const output = await getAppProviderByClassName<ToolExecutorService>(
      'ToolExecutorService',
    ).dispatch(
      {
        name: 'code_interpreter',
        label: 'Code interpreter',
        description: 'Code interpreter',
        category: ToolCategory.ACTION,
        executionRef: { kind: 'static', toolId: 'code_interpreter' },
      },
      { code: 'pass' },
      {
        workspaceId: authContext.workspace.id,
        roleId,
        rolePermissionConfig: { intersectionOf: [roleId] },
        authContext,
        ...(isUserAuthContext(authContext)
          ? {
              userId: authContext.user.id,
              userWorkspaceId: authContext.userWorkspaceId,
            }
          : {}),
      },
    );

    if (!output.success) {
      throw new Error(
        `Expected the code interpreter to run: ${output.error ?? output.message}`,
      );
    }

    return executeSpy.mock.calls[0]?.[2]?.env?.TWENTY_API_TOKEN;
  } finally {
    executeSpy.mockRestore();
  }
};
