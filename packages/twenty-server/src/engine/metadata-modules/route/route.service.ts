import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Request } from 'express';
import { match } from 'path-to-regexp';
import { isDefined } from 'twenty-shared/utils';

import {
  HTTPMethod,
  Route,
} from 'src/engine/metadata-modules/route/route.entity';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';

@Injectable()
export class RouteService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly domainManagerService: DomainManagerService,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {}

  private async getOneRouteWithPathParamsOrFail({
    request,
    httpMethod,
  }: {
    request: Request;
    httpMethod: HTTPMethod;
  }): Promise<{
    route: Route;
    pathParams: Partial<Record<string, string | string[]>>;
  }> {
    const host = `${request.protocol}://${request.get('host')}`;

    const workspace =
      await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
        host,
      );

    workspaceValidator.assertIsDefinedOrThrow(
      workspace,
      new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    const routes = await this.routeRepository.find({
      where: {
        httpMethod,
        workspaceId: workspace.id,
      },
      relations: ['serverlessFunction'],
    });

    const requestPath = request.path.replace(/^\/s\//, '/');

    for (const route of routes) {
      const routeMatcher = match(route.path, { decode: decodeURIComponent });
      const routeMatched = routeMatcher(requestPath);

      if (routeMatched) {
        return {
          route,
          pathParams: routeMatched.params,
        };
      }
    }

    throw new NotFoundException('No Route found');
  }

  private async validateWorkspaceFromRequest({
    request,
    workspaceId,
  }: {
    request: Request;
    workspaceId: string;
  }) {
    const { workspace } =
      await this.accessTokenService.validateTokenByRequest(request);

    if (!isDefined(workspace)) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.id !== workspaceId) {
      throw new ForbiddenException('Invalid Workspace');
    }
  }

  async handle({
    request,
    httpMethod,
  }: {
    request: Request;
    httpMethod: HTTPMethod;
  }) {
    const routeWithPathParams = await this.getOneRouteWithPathParamsOrFail({
      request,
      httpMethod,
    });

    if (routeWithPathParams.route.isAuthRequired) {
      await this.validateWorkspaceFromRequest({
        request,
        workspaceId: routeWithPathParams.route.workspaceId,
      });
    }

    const queryParams = request.query;

    const bodyParams = request.body;

    const executionParams = {
      ...queryParams,
      ...bodyParams,
      ...routeWithPathParams.pathParams,
    };

    return await this.serverlessFunctionService.executeOneServerlessFunction(
      routeWithPathParams.route.serverlessFunction.id,
      routeWithPathParams.route.workspaceId,
      executionParams,
      'draft',
    );
  }
}
