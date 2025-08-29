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

@Injectable()
export class RouteService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly serverlessFunctionService: ServerlessFunctionService,
    @InjectRepository(Route)
    private readonly routeRepository: Repository<Route>,
  ) {}

  private async getOneRouteWithPathParamsOrFail({
    workspaceId,
    request,
    httpMethod,
  }: {
    workspaceId: string;
    request: Request;
    httpMethod: HTTPMethod;
  }): Promise<{
    route: Route;
    pathParams: Partial<Record<string, string | string[]>>;
  }> {
    const routes = await this.routeRepository.find({
      where: {
        httpMethod,
        workspaceId,
      },
      relations: ['serverlessFunction'],
    });

    const requestPath = request.path.replace(`/s/${workspaceId}/`, '');

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
    workspaceId,
    request,
    httpMethod,
  }: {
    workspaceId: string;
    request: Request;
    httpMethod: HTTPMethod;
  }) {
    const routeWithPathParams = await this.getOneRouteWithPathParamsOrFail({
      workspaceId,
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
