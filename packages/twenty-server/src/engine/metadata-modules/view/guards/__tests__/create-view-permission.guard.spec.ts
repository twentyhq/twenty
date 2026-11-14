import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ViewVisibility } from 'twenty-shared/types';

import { CreateViewPermissionGuard } from 'src/engine/metadata-modules/view/guards/create-view-permission.guard';
import { type ViewAccessService } from 'src/engine/permissions/metadata-permissions/services/view-access.service';

const request = {
  workspace: { id: 'workspace-id' },
  userWorkspaceId: 'user-workspace-id',
  body: {
    query: 'mutation CreateView { createView }',
    ownerViewFieldId: 'smuggled-view-field-id',
  },
};

const mockGqlContext = (args: Record<string, unknown>) =>
  jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
    getContext: () => ({ req: request }),
    getArgs: () => args,
  } as unknown as GqlExecutionContext);

describe('CreateViewPermissionGuard', () => {
  it('reads the owner column from the GraphQL input, never from the request body', async () => {
    const canUserCreateView = jest.fn().mockResolvedValue(true);
    const guard = new CreateViewPermissionGuard({
      canUserCreateView,
    } as unknown as ViewAccessService);

    mockGqlContext({ input: { visibility: ViewVisibility.WORKSPACE } });

    await guard.canActivate({} as ExecutionContext);

    expect(canUserCreateView).toHaveBeenCalledTimes(1);
    expect(canUserCreateView).toHaveBeenCalledWith({
      visibility: ViewVisibility.WORKSPACE,
      ownerViewFieldId: undefined,
      accessContext: {
        workspaceId: 'workspace-id',
        userWorkspaceId: 'user-workspace-id',
      },
    });
  });
});
