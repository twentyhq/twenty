import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Request } from 'express';
import { match } from 'path-to-regexp';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Repository } from 'typeorm';
import { HTTPMethod } from 'twenty-shared/types';

import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import {
  RouteTriggerException,
  RouteTriggerExceptionCode,
} from 'src/engine/metadata-modules/route-trigger/exceptions/route-trigger.exception';
import { buildServerlessFunctionEvent } from 'src/engine/metadata-modules/route-trigger/utils/build-serverless-function-event.util';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';

@Injectable()
export class RouteTriggerService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    @InjectRepository(ServerlessFunctionEntity)
    private readonly serverlessFunctionRepository: Repository<ServerlessFunctionEntity>,
  ) {}

  private async getServerlessFunctionWithPathParamsOrFail({
    request,
    httpMethod,
  }: {
    request: Request;
    httpMethod: HTTPMethod;
  }): Promise<{
    serverlessFunction: ServerlessFunctionEntity;
    pathParams: Partial<Record<string, string | string[]>>;
  }> {
    const host = `${request.protocol}://${request.get('host')}`;

    const workspace =
      await this.workspaceDomainsService.getWorkspaceByOriginOrDefaultWorkspace(
        host,
      );

    assertIsDefinedOrThrow(
      workspace,
      new RouteTriggerException(
        'Workspace not found',
        RouteTriggerExceptionCode.WORKSPACE_NOT_FOUND,
      ),
    );

    const serverlessFunctionsWithHttpRouteTrigger =
      await this.serverlessFunctionRepository.find({
        where: {
          workspaceId: workspace.id,
          httpRouteTriggerSettings: Not(IsNull()),
        },
      });

    const requestPath = request.path.replace(/^\/s\//, '/');

    for (const serverlessFunction of serverlessFunctionsWithHttpRouteTrigger) {
      const httpRouteSettings = serverlessFunction.httpRouteTriggerSettings;

      if (
        !isDefined(httpRouteSettings) ||
        httpRouteSettings.httpMethod !== httpMethod
      ) {
        continue;
      }

      const routeMatcher = match(httpRouteSettings.path, {
        decode: decodeURIComponent,
      });
      const routeMatched = routeMatcher(requestPath);

      if (routeMatched) {
        return {
          serverlessFunction,
          pathParams: routeMatched.params,
        };
      }
    }

    throw new RouteTriggerException(
      'No Route trigger found',
      RouteTriggerExceptionCode.TRIGGER_NOT_FOUND,
    );
  }

  private async validateWorkspaceFromRequest({
    request,
    workspaceId,
  }: {
    request: Request;
    workspaceId: string;
  }) {
    const authContext =
      await this.accessTokenService.validateTokenByRequest(request);

    if (!isDefined(authContext.workspace)) {
      throw new RouteTriggerException(
        'Workspace not found',
        RouteTriggerExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    if (authContext.workspace.id !== workspaceId) {
      throw new RouteTriggerException(
        'You are not authorized',
        RouteTriggerExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }

    return authContext;
  }

  async handle({
    request,
    httpMethod,
  }: {
    request: Request;
    httpMethod: HTTPMethod;
  }) {
    const { serverlessFunction, pathParams } =
      await this.getServerlessFunctionWithPathParamsOrFail({
        request,
        httpMethod,
      });

    const httpRouteSettings = serverlessFunction.httpRouteTriggerSettings;

    if (httpRouteSettings?.isAuthRequired) {
      await this.validateWorkspaceFromRequest({
        request,
        workspaceId: serverlessFunction.workspaceId,
      });
    }

    const event = buildServerlessFunctionEvent({
      request,
      pathParameters: pathParams,
      forwardedRequestHeaders:
        httpRouteSettings?.forwardedRequestHeaders ?? [],
    });

    const result =
      await this.serverlessFunctionService.executeOneServerlessFunction({
        id: serverlessFunction.id,
        workspaceId: serverlessFunction.workspaceId,
        payload: event,
        version: 'draft',
      });

    if (!isDefined(result)) {
      return result;
    }

    if (result.error) {
      throw new RouteTriggerException(
        result.error.errorMessage,
        RouteTriggerExceptionCode.SERVERLESS_FUNCTION_EXECUTION_ERROR,
      );
    }

    return result.data;
  }
}
