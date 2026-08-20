import { type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { ViewChildEntityPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/view-child-entity-permission.guard';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

const buildGuard = ({ args, params }: { args: object; params?: object }) => {
  const request = {
    workspace: { id: WORKSPACE_ID },
    userWorkspaceId: 'user-workspace-id',
    params,
  };

  jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
    getContext: () => ({ req: request }),
    getArgs: () => args,
  } as never);

  const viewAccessService = {
    canUserModifyViewByChildEntity: jest.fn().mockResolvedValue(true),
  };
  const viewEntityLookupService = {
    findViewIdByEntityIdAndKind: jest.fn().mockResolvedValue('view-id'),
  };

  const GuardClass = ViewChildEntityPermissionGuard('viewFilterGroup');

  return {
    guard: new (GuardClass as new (...args: never[]) => {
      canActivate: (context: ExecutionContext) => Promise<boolean>;
    })(viewAccessService as never, viewEntityLookupService as never),
    viewEntityLookupService,
    viewAccessService,
  };
};

describe('ViewChildEntityPermissionGuard', () => {
  afterEach(() => jest.restoreAllMocks());

  it('resolves the view from a top-level id argument', async () => {
    const { guard, viewEntityLookupService } = buildGuard({
      args: { id: 'entity-id' },
    });

    await guard.canActivate({} as ExecutionContext);

    expect(
      viewEntityLookupService.findViewIdByEntityIdAndKind,
    ).toHaveBeenCalledWith('viewFilterGroup', 'entity-id', WORKSPACE_ID);
  });

  it('prefers the top-level id over one carried in the input', async () => {
    const { guard, viewEntityLookupService } = buildGuard({
      args: { id: 'routed-entity-id', input: { id: 'other-entity-id' } },
    });

    await guard.canActivate({} as ExecutionContext);

    expect(
      viewEntityLookupService.findViewIdByEntityIdAndKind,
    ).toHaveBeenCalledWith('viewFilterGroup', 'routed-entity-id', WORKSPACE_ID);
  });

  it('falls back to the input id when the mutation takes no top-level id', async () => {
    const { guard, viewEntityLookupService } = buildGuard({
      args: { input: { id: 'entity-id' } },
    });

    await guard.canActivate({} as ExecutionContext);

    expect(
      viewEntityLookupService.findViewIdByEntityIdAndKind,
    ).toHaveBeenCalledWith('viewFilterGroup', 'entity-id', WORKSPACE_ID);
  });

  it('falls back to the REST path parameter', async () => {
    const { guard, viewEntityLookupService } = buildGuard({
      args: {},
      params: { id: 'entity-id' },
    });

    await guard.canActivate({} as ExecutionContext);

    expect(
      viewEntityLookupService.findViewIdByEntityIdAndKind,
    ).toHaveBeenCalledWith('viewFilterGroup', 'entity-id', WORKSPACE_ID);
  });

  it('does not look a view up when no entity id is named', async () => {
    const { guard, viewEntityLookupService, viewAccessService } = buildGuard({
      args: {},
    });

    await guard.canActivate({} as ExecutionContext);

    expect(
      viewEntityLookupService.findViewIdByEntityIdAndKind,
    ).not.toHaveBeenCalled();
    expect(
      viewAccessService.canUserModifyViewByChildEntity,
    ).toHaveBeenCalledWith(null, 'user-workspace-id', WORKSPACE_ID, undefined);
  });
});
