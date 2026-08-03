import { Injectable, type NestMiddleware } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type NextFunction, type Request, type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { isRequestOriginAllowed } from 'src/engine/core-modules/user-session/utils/is-request-origin-allowed.util';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Only guards requests that would authenticate through the session cookie,
// since Bearer headers are never attached cross-site. SameSite=Lax already
// blocks cross-site POSTs; checking Origin closes the sibling-subdomain gap,
// which is same-site and so not covered by Lax.
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

    // Any other Authorization scheme still falls through to cookie auth, so it
    // must not skip the check. Extracted the same way the auth pipeline does,
    // so the two cannot disagree about a request.
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

    // Fails closed on a missing Origin: browsers send it on every unsafe
    // request, so its absence is either a non-browser client, which belongs on
    // a Bearer token, or a stripped header we cannot tell from a forgery.
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
