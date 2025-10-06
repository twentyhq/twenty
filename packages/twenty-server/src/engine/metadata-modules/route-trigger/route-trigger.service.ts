import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Request } from 'express';
import { match } from 'path-to-regexp';
import { assertIsDefinedOrThrow, isDefined } from 'twenty-shared/utils';

import {
  HTTPMethod,
  RouteTrigger,
} from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';

@Injectable()
export class RouteTriggerService {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly domainManagerService: DomainManagerService,
    @InjectRepository(RouteTrigger)
    private readonly routeTriggerRepository: Repository<RouteTrigger>,
  ) {}

  private async getOneRouteTriggerWithPathParamsOrFail({
    request,
    httpMethod,
  }: {
    request: Request;
    httpMethod: HTTPMethod;
  }): Promise<{
    routeTrigger: RouteTrigger;
    pathParams: Partial<Record<string, string | string[]>>;
  }> {
    const host = `${request.protocol}://${request.get('host')}`;

    const workspace =
      await this.domainManagerService.getWorkspaceByOriginOrDefaultWorkspace(
        host,
      );

    assertIsDefinedOrThrow(
      workspace,
      new AuthException(
        'Workspace not found',
        AuthExceptionCode.WORKSPACE_NOT_FOUND,
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

    throw new NotFoundException('No Route trigger found');
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

    return await this.serverlessFunctionService.executeOneServerlessFunction(
      routeTriggerWithPathParams.routeTrigger.serverlessFunction.id,
      routeTriggerWithPathParams.routeTrigger.workspaceId,
      executionParams,
      'draft',
    );
  }
}
