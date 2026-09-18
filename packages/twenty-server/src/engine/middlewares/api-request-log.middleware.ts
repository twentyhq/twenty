import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type NextFunction, type Request, type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const MAX_LOGGED_OPERATION_NAMES = 10;

@Injectable()
export class ApiRequestLogMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ApiRequestLogMiddleware.name);

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  use(request: Request, response: Response, next: NextFunction) {
    if (!this.twentyConfigService.get('API_REQUEST_LOG_ENABLED')) {
      next();

      return;
    }

    const startedAtMs = Date.now();

    // The auth context is bound to the request by a later middleware or guard,
    // so the actor is only knowable once the response is done.
    response.once('finish', () => {
      this.logger.log(this.buildLine(request, response, startedAtMs));
    });

    next();
  }

  private buildLine(
    request: Request,
    response: Response,
    startedAtMs: number,
  ): string {
    const [path] = request.originalUrl.split('?');

    return this.toLogfmt({
      method: request.method,
      route: path,
      operations: this.extractOperationNames(request),
      status: response.statusCode,
      durationMs: Date.now() - startedAtMs,
      ...this.extractActor(request),
      workspaceId: request.workspaceId,
      userWorkspaceId: request.userWorkspaceId,
      authProvider: request.authProvider ?? undefined,
      tokenType: request.tokenType,
      impersonatorUserWorkspaceId:
        request.impersonationContext?.impersonatorUserWorkspaceId,
      ip: request.ip,
    });
  }

  private extractActor(request: Request): Record<string, string | undefined> {
    if (isDefined(request.apiKey)) {
      return { actor: 'apiKey', apiKeyId: request.apiKey.id };
    }

    if (isDefined(request.application)) {
      return { actor: 'application', applicationId: request.application.id };
    }

    if (isDefined(request.user)) {
      return { actor: 'user', userId: request.user.id };
    }

    return { actor: 'anonymous' };
  }

  private extractOperationNames(request: Request): string | undefined {
    const body: unknown = request.body;
    const operations = (Array.isArray(body) ? body : [body])
      .map((entry) =>
        isDefined(entry) && typeof entry === 'object'
          ? (entry as { operationName?: unknown }).operationName
          : undefined,
      )
      .filter(isNonEmptyString)
      .slice(0, MAX_LOGGED_OPERATION_NAMES);

    return operations.length > 0 ? operations.join(',') : undefined;
  }

  private toLogfmt(fields: Record<string, string | number | undefined>) {
    return Object.entries(fields)
      .filter(([, value]) => isDefined(value))
      .map(([key, value]) => `${key}=${this.quote(String(value))}`)
      .join(' ');
  }

  private quote(value: string): string {
    return /[\s"]/.test(value) ? `"${value.replace(/"/g, '\\"')}"` : value;
  }
}
