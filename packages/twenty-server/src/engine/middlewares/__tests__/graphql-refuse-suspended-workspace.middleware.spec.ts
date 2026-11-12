import { Test } from '@nestjs/testing';

import { type NextFunction, type Response } from 'express';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { AuthExceptionCode } from 'src/engine/core-modules/auth/auth.exception';
import { GraphQLRefuseSuspendedWorkspaceMiddleware } from 'src/engine/middlewares/graphql-refuse-suspended-workspace.middleware';
import { MiddlewareService } from 'src/engine/middlewares/middleware.service';

describe('GraphQLRefuseSuspendedWorkspaceMiddleware', () => {
  const writeGraphqlResponseOnExceptionCaught = jest.fn();
  let middleware: GraphQLRefuseSuspendedWorkspaceMiddleware;
  let next: NextFunction;

  const response = {} as Response;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        GraphQLRefuseSuspendedWorkspaceMiddleware,
        {
          provide: MiddlewareService,
          useValue: { writeGraphqlResponseOnExceptionCaught },
        },
      ],
    }).compile();

    middleware = module.get(GraphQLRefuseSuspendedWorkspaceMiddleware);
    next = jest.fn();
  });

  it.each([
    WorkspaceActivationStatus.SUSPENDED,
    WorkspaceActivationStatus.INACTIVE,
  ])(
    'should refuse a %s workspace without calling next',
    (activationStatus) => {
      const request = {
        workspace: { activationStatus, deletedAt: undefined },
      };

      middleware.use(request, response, next);

      expect(next).not.toHaveBeenCalled();
      expect(writeGraphqlResponseOnExceptionCaught).toHaveBeenCalledWith(
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
      {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
        deletedAt: undefined,
      },
    ],
    ['no workspace', undefined],
  ])('should call next for %s', (_label, workspace) => {
    middleware.use({ workspace }, response, next);

    expect(next).toHaveBeenCalled();
    expect(writeGraphqlResponseOnExceptionCaught).not.toHaveBeenCalled();
  });
});
