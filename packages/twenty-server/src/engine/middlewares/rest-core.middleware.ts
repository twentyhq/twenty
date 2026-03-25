import { Injectable, type NestMiddleware } from '@nestjs/common';

import { type NextFunction, type Request, type Response } from 'express';

import { MiddlewareService } from 'src/engine/middlewares/middleware.service';

@Injectable()
export class RestCoreMiddleware implements NestMiddleware {
  constructor(private readonly middlewareService: MiddlewareService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      await this.middlewareService.hydrateRestRequest(req);
    } catch (error) {
      this.middlewareService.writeRestResponseOnExceptionCaught(res, error);

      return;
    }

    next();
  }
}
