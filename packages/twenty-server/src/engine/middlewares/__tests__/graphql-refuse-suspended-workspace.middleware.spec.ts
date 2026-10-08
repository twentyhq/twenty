import { type NextFunction, type Request, type Response } from 'express';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { GraphQLRefuseSuspendedWorkspaceMiddleware } from 'src/engine/middlewares/graphql-refuse-suspended-workspace.middleware';
import { type MiddlewareService } from 'src/engine/middlewares/middleware.service';

describe('GraphQLRefuseSuspendedWorkspaceMiddleware', () => {
  let middlewareService: jest.Mocked<MiddlewareService>;
  let middleware: GraphQLRefuseSuspendedWorkspaceMiddleware;
  let next: NextFunction;

  const response = {} as Response;

  beforeEach(() => {
    middlewareService = {
      writeGraphqlResponseOnExceptionCaught: jest.fn(),
    } as unknown as jest.Mocked<MiddlewareService>;
    middleware = new GraphQLRefuseSuspendedWorkspaceMiddleware(
      middlewareService,
    );
    next = jest.fn();
  });

  it.each([
    WorkspaceActivationStatus.SUSPENDED,
    WorkspaceActivationStatus.INACTIVE,
  ])(
    'should refuse a %s workspace without calling next',
    (activationStatus) => {
      const request = {
        workspace: { id: 'workspace-id', activationStatus },
      } as unknown as Request;

      middleware.use(request, response, next);

      expect(next).not.toHaveBeenCalled();
      expect(
        middlewareService.writeGraphqlResponseOnExceptionCaught,
      ).toHaveBeenCalledWith(
        response,
        expect.objectContaining({
          code: AuthExceptionCode.WORKSPACE_SUSPENDED,
        }),
      );
    },
  );

  it.each([
    [
      'an active workspace',
      { activationStatus: WorkspaceActivationStatus.ACTIVE },
    ],
    ['no workspace', undefined],
  ])('should call next for %s', (_label, workspace) => {
    middleware.use({ workspace } as unknown as Request, response, next);

    expect(next).toHaveBeenCalled();
    expect(
      middlewareService.writeGraphqlResponseOnExceptionCaught,
    ).not.toHaveBeenCalled();
  });
});
