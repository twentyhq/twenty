import { Injectable, type NestMiddleware } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type NextFunction, type Request, type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { isRequestOriginAllowed } from 'src/engine/core-modules/user-session/utils/is-request-origin-allowed.util';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Bearer-authenticated requests are CSRF-immune (headers are never attached
// cross-site), so this only guards requests that would authenticate through
// the session cookie. SameSite=Lax already blocks true cross-site POSTs;
// validating the Origin header additionally closes the sibling-subdomain
// gap, which is same-site and therefore not covered by Lax.
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

    // Only a Bearer token authenticates without the cookie. Any other
    // Authorization scheme still falls through to cookie authentication, so
    // it must not skip the CSRF check. Extracted the same way the auth
    // pipeline does it, so the two cannot disagree about a given request.
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

    // Fails closed on a missing Origin. Browsers send it on every unsafe
    // request, so its absence means either a non-browser client, which should
    // be using a Bearer token, or a stripped header we cannot tell apart from
    // a forged request.
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
