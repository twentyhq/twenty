import { Injectable } from '@nestjs/common';

import { Request, Response } from 'express';
import { ExtractJwt } from 'passport-jwt';

import { EXCLUDED_MIDDLEWARE_OPERATIONS } from 'src/engine/middlewares/constants/excluded-middleware-operations.constant';

@Injectable()
export class MiddlewareService {
  constructor() {}

  public excludedOperations = EXCLUDED_MIDDLEWARE_OPERATIONS;

  public isTokenPresent(request: Request): boolean {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    return !!token;
  }

  public writeResponseOnExceptionCaught(
    res: Response,
    source: 'rest' | 'graphql',
    error: any,
    errors: any[],
  ) {
    res.writeHead(
      source === 'graphql'
        ? 200
        : error instanceof Error
          ? 500
          : error.status || 500,
      { 'Content-Type': 'application/json' },
    );
    res.write(
      JSON.stringify({
        errors,
      }),
    );
    res.end();
  }
}
