import { Injectable, type NestMiddleware } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type NextFunction, type Request, type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { isRequestOriginAllowed } from 'src/engine/core-modules/user-session/utils/is-request-origin-allowed.util';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Origin covers the same-site sibling-subdomain gap SameSite=Lax leaves; Bearer headers are never sent cross-site
@Injectable()
export class CookieSessionCsrfMiddleware implements NestMiddleware {
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly userSessionCookieService: UserSessionCookieService,
    private readonly jwtWrapperService: JwtWrapperService,
  ) {}

  use(request: Request, response: Response, next: NextFunction): void {
    if (SAFE_METHODS.has(request.method)) {
      return next();
    }

    // Other Authorization schemes still fall through to cookie auth, so they must not skip the check
    if (
      isNonEmptyString(this.jwtWrapperService.extractJwtFromRequest()(request))
    ) {
      return next();
    }

    if (
      !isDefined(
        this.userSessionCookieService.extractSessionTokenFromRequest(request),
      )
    ) {
      return next();
    }

    const origin = request.headers.origin;

    // Fail closed: browsers always send Origin on unsafe requests, so its absence can't be told from a forgery
    if (
      isNonEmptyString(origin) &&
      isRequestOriginAllowed({
        origin,
        request,
        twentyConfigService: this.twentyConfigService,
      })
    ) {
      return next();
    }

    response.status(403).json({
      statusCode: 403,
      messages: [
        'Request origin is not allowed for cookie-authenticated requests',
      ],
      error: 'CSRF_ORIGIN_MISMATCH',
    });
  }
}
