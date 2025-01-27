import { Injectable } from '@nestjs/common';

import { Request, Response } from 'express';
import { ExtractJwt } from 'passport-jwt';

import { EXCLUDED_MIDDLEWARE_OPERATIONS } from 'src/engine/middlewares/constants/excluded-middleware-operations.constant';
import { isDefined } from 'src/utils/is-defined';

@Injectable()
export class MiddlewareService {
  constructor() {}

  public excludedOperations = EXCLUDED_MIDDLEWARE_OPERATIONS;

  public isTokenPresent(request: Request): boolean {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    return !!token;
  }

  private hasErrorStatus(error: unknown): error is { status: number } {
    return isDefined((error as { status: number }).status);
  }

  public writeResponseOnExceptionCaught(
    res: Response,
    source: 'rest' | 'graphql',
    error: unknown,
    errors: unknown[],
  ) {
    const getStatus = () => {
      if (source === 'graphql') {
        return 200;
      }

      if (this.hasErrorStatus(error)) {
        return error.status;
      }

      return 500;
    };

    res.writeHead(getStatus(), { 'Content-Type': 'application/json' });
    res.write(
      JSON.stringify({
        errors,
      }),
    );
    res.end();
  }
}
