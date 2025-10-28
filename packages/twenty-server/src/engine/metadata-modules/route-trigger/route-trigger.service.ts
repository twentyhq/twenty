import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Request } from 'express';
import { match } from 'path-to-regexp';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import {
  RouteTriggerException,
  RouteTriggerExceptionCode,
} from 'src/engine/metadata-modules/route-trigger/exceptions/route-trigger.exception';
import {
  HTTPMethod,
  RouteTriggerEntity,
} from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';

@Injectable()
export class RouteTriggerService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
    @InjectRepository(RouteTriggerEntity)
    private readonly routeTriggerRepository: Repository<RouteTriggerEntity>,
  ) {}

  private async getOneRouteTriggerWithPathParamsOrFail({
    request,
    httpMethod,
  }: {
    request: Request;
    httpMethod: HTTPMethod;
  }): Promise<{
    routeTrigger: RouteTriggerEntity;
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

    const routeTriggers = await this.routeTriggerRepository.find({
      where: {
        httpMethod,
        workspaceId: workspace.id,
      },
      relations: ['serverlessFunction'],
    });

    const requestPath = request.path.replace(/^\/s\//, '/');

    for (const routeTrigger of routeTriggers) {
      const routeTriggerMatcher = match(routeTrigger.path, {
        decode: decodeURIComponent,
      });
      const routeTriggerMatched = routeTriggerMatcher(requestPath);

      if (routeTriggerMatched) {
        return {
          routeTrigger,
          pathParams: routeTriggerMatched.params,
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
    const { workspace } =
      await this.accessTokenService.validateTokenByRequest(request);

    if (!isDefined(workspace)) {
      throw new RouteTriggerException(
        'Workspace not found',
        RouteTriggerExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    if (workspace.id !== workspaceId) {
      throw new RouteTriggerException(
        'You are not authorized',
        RouteTriggerExceptionCode.FORBIDDEN_EXCEPTION,
      );
    }
  }

  async handle({
    request,
    httpMethod,
  }: {
    request: Request;
    httpMethod: HTTPMethod;
  }) {
    const routeTriggerWithPathParams =
      await this.getOneRouteTriggerWithPathParamsOrFail({
        request,
        httpMethod,
      });

    if (routeTriggerWithPathParams.routeTrigger.isAuthRequired) {
      await this.validateWorkspaceFromRequest({
        request,
        workspaceId: routeTriggerWithPathParams.routeTrigger.workspaceId,
      });
    }

    const queryParams = request.query;

    const bodyParams = request.body;

    const executionParams = {
      ...queryParams,
      ...bodyParams,
      ...routeTriggerWithPathParams.pathParams,
    };

    const result =
      await this.serverlessFunctionService.executeOneServerlessFunction(
        routeTriggerWithPathParams.routeTrigger.serverlessFunction.id,
        routeTriggerWithPathParams.routeTrigger.workspaceId,
        executionParams,
        'draft',
      );

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
