import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { CreateViewChildEntityPermissionGuard } from 'src/engine/metadata-modules/view-permissions/guards/create-view-child-entity-permission.guard';
import { ViewAccessService } from 'src/engine/metadata-modules/view-permissions/services/view-access.service';

jest.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: {
    create: jest.fn(),
  },
}));

describe('CreateViewChildEntityPermissionGuard', () => {
  let guard: CreateViewChildEntityPermissionGuard;
  let mockViewAccessService: jest.Mocked<ViewAccessService>;

  beforeEach(() => {
    mockViewAccessService = {
      canUserModifyViewByChildEntity: jest.fn(),
    } as unknown as jest.Mocked<ViewAccessService>;

    guard = new CreateViewChildEntityPermissionGuard(mockViewAccessService);
  });

  it('validates permissions for all distinct views in a batch creation', async () => {
    const mockRequest = {
      req: {
        body: {},
        workspace: { id: 'ws-1' },
      },
    };
    const mockArgs = {
      inputs: [
        { viewId: 'view-1' },
        { viewId: 'view-2' },
        { viewId: 'view-1' },
      ],
    };

    (GqlExecutionContext.create as jest.Mock).mockReturnValue({
      getContext: () => mockRequest,
      getArgs: () => mockArgs,
    });

    mockViewAccessService.canUserModifyViewByChildEntity.mockResolvedValue(
      true,
    );

    const context = {} as ExecutionContext;
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(
      mockViewAccessService.canUserModifyViewByChildEntity,
    ).toHaveBeenCalledTimes(2);
    expect(
      mockViewAccessService.canUserModifyViewByChildEntity,
    ).toHaveBeenNthCalledWith(
      1,
      'view-1',
      expect.objectContaining({ workspaceId: 'ws-1' }),
    );
    expect(
      mockViewAccessService.canUserModifyViewByChildEntity,
    ).toHaveBeenNthCalledWith(
      2,
      'view-2',
      expect.objectContaining({ workspaceId: 'ws-1' }),
    );
  });

  it('denies access if any view in a batch creation is not authorized', async () => {
    const mockRequest = {
      req: {
        body: {},
        workspace: { id: 'ws-1' },
      },
    };
    const mockArgs = {
      inputs: [{ viewId: 'allowed-view' }, { viewId: 'forbidden-view' }],
    };

    (GqlExecutionContext.create as jest.Mock).mockReturnValue({
      getContext: () => mockRequest,
      getArgs: () => mockArgs,
    });

    mockViewAccessService.canUserModifyViewByChildEntity
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const context = {} as ExecutionContext;
    const result = await guard.canActivate(context);

    expect(result).toBe(false);
    expect(
      mockViewAccessService.canUserModifyViewByChildEntity,
    ).toHaveBeenCalledTimes(2);
  });
});
