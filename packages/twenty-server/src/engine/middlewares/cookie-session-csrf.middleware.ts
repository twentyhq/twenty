import { Injectable, type NestMiddleware } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type NextFunction, type Request, type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserSessionCookieService } from 'src/engine/core-modules/user-session/services/user-session-cookie.service';
import { resolveAllowedCredentialedOrigins } from 'src/engine/core-modules/user-session/utils/resolve-allowed-credentialed-origins.util';
import { getRequestBaseUrl } from 'src/utils/get-request-base-url.util';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// URL.origin drops a default port, so the two spellings of the same origin
// collapse. Returns undefined for anything unparseable, which never matches.
const toComparableOrigin = (value: string): string | undefined => {
  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return undefined;
  }
};

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

    // Non-browser clients omit Origin and never attach cookies cross-site.
    if (!isNonEmptyString(origin)) {
      return next();
    }

    if (this.isOriginAllowed(origin, request)) {
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

  private isOriginAllowed(origin: string, request: Request): boolean {
    const normalizedOrigin = origin.toLowerCase();

    // Same shared helper the discovery controllers use, so the origin this
    // request arrived on is derived one way (and honors `trust proxy`).
    // Compared through URL rather than as strings: browsers omit :443 and :80
    // from Origin while Host keeps whatever port the client spelled out, so a
    // genuine same-origin POST would otherwise 403 on the port alone.
    const comparableOrigin = toComparableOrigin(normalizedOrigin);
    const comparableRequestOrigin = toComparableOrigin(
      getRequestBaseUrl(request),
    );

    if (
      isDefined(comparableOrigin) &&
      comparableOrigin === comparableRequestOrigin
    ) {
      return true;
    }

    return resolveAllowedCredentialedOrigins(this.twentyConfigService).has(
      normalizedOrigin,
    );
  }
}
