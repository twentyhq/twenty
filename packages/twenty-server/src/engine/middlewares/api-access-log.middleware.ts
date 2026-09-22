import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';

import { type NextFunction, type Request, type Response } from 'express';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { buildApiAccessLogLine } from 'src/engine/middlewares/utils/build-api-access-log-line.util';
import { computeRequestTraceContext } from 'src/engine/utils/compute-request-trace-context.util';

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
          buildApiAccessLogLine({
            request,
            response,
            durationMs: Date.now() - startedAtMs,
            traceContext,
          }),
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
}
