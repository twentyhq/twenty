import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type NextFunction, type Request, type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { computeRequestActor } from 'src/engine/utils/compute-request-actor.util';
import { computeRequestTraceContext } from 'src/engine/utils/compute-request-trace-context.util';

const MAX_LOGGED_RESOLVERS_LENGTH = 512;

@Injectable()
export class ApiAccessLogMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ApiAccessLogMiddleware.name);

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  use(request: Request, response: Response, next: NextFunction) {
    if (!this.twentyConfigService.get('API_ACCESS_LOG_ENABLED')) {
      next();

      return;
    }

    const startedAtMs = Date.now();
    const traceContext = computeRequestTraceContext();

    let logged = false;
    const log = () => {
      if (logged) {
        return;
      }

      logged = true;

      try {
        this.logger.log(
          this.buildLine(request, response, startedAtMs, traceContext),
        );
      } catch (error) {
        this.logger.warn(
          `Failed to build the access log line: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    response.once('finish', log);
    response.once('close', log);

    next();
  }

  private buildLine(
    request: Request,
    response: Response,
    startedAtMs: number,
    traceContext: ReturnType<typeof computeRequestTraceContext>,
  ): string {
    const [urlPath] = (request.originalUrl ?? '').split('?');

    return this.toLogfmt({
      method: request.method,
      url_path: urlPath,
      resolvers: this.formatResolvers(request.executedRootResolvers),
      status: response.statusCode,
      duration_ms: Date.now() - startedAtMs,
      ...this.formatActor(request),
      workspace_id: request.workspaceId,
      auth_provider: request.authProvider ?? undefined,
      token_type: request.tokenType,
      client_ip: request.ip,
      request_id: this.formatHeader(request.headers?.['x-request-id']),
      trace_id: traceContext?.traceId,
      span_id: traceContext?.spanId,
      trace_sampled: traceContext?.sampled,
    });
  }

  private formatActor(request: Request): Record<string, string | undefined> {
    const actor = computeRequestActor(request);

    return isDefined(actor)
      ? { actor: actor.kind, actor_id: actor.id }
      : { actor: 'anonymous' };
  }

  private formatHeader(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
  }

  private formatResolvers(resolvers: string[] | undefined) {
    if (!isDefined(resolvers) || resolvers.length === 0) {
      return undefined;
    }

    const joined = resolvers.join(',');

    if (joined.length <= MAX_LOGGED_RESOLVERS_LENGTH) {
      return joined;
    }

    const kept: string[] = [];
    let length = 0;

    for (const name of resolvers) {
      if (length + name.length + 1 > MAX_LOGGED_RESOLVERS_LENGTH) {
        break;
      }

      kept.push(name);
      length += name.length + 1;
    }

    return `${kept.join(',')},+${resolvers.length - kept.length}`;
  }

  private toLogfmt(
    fields: Record<string, string | number | boolean | undefined>,
  ): string {
    return Object.entries(fields)
      .filter(([, value]) => isDefined(value))
      .map(([key, value]) => `${key}=${this.quote(String(value))}`)
      .join(' ');
  }

  private quote(value: string): string {
    return isNonEmptyString(value) && !/[\s"=\\]/.test(value)
      ? value
      : `"${value.replace(/[\\"]/g, (character) => `\\${character}`)}"`;
  }
}
