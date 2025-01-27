import { Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { handleException } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { MiddlewareService } from 'src/engine/middlewares/middleware.service';

@Injectable()
export class RestCoreMiddleware implements NestMiddleware {
  constructor(
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly middlewareService: MiddlewareService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      await this.middlewareService.authenticateRestRequest(req);
    } catch (error) {
      const errors = [handleException(error, this.exceptionHandlerService)];

      this.middlewareService.writeResponseOnExceptionCaught(
        res,
        'rest',
        error,
        errors,
      );

      res.end();

      return;
    }

    next();
  }
}
