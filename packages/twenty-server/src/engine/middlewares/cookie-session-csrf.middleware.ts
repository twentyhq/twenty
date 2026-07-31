import { Injectable, type NestMiddleware } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type NextFunction, type Request, type Response } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { extractUserSessionTokenFromRequestCookie } from 'src/engine/core-modules/user-session/utils/extract-user-session-token-from-request.util';
import { resolveAllowedCredentialedOrigins } from 'src/engine/core-modules/user-session/utils/resolve-allowed-credentialed-origins.util';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Bearer-authenticated requests are CSRF-immune (headers are never attached
// cross-site), so this only guards requests that would authenticate through
// the session cookie. SameSite=Lax already blocks true cross-site POSTs;
// validating the Origin header additionally closes the sibling-subdomain
// gap, which is same-site and therefore not covered by Lax.
@Injectable()
export class CookieSessionCsrfMiddleware implements NestMiddleware {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  use(request: Request, response: Response, next: NextFunction): void {
    if (SAFE_METHODS.has(request.method)) {
      return next();
    }

    if (isDefined(request.headers.authorization)) {
      return next();
    }

    if (!isDefined(extractUserSessionTokenFromRequestCookie(request))) {
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

    const requestHost = request.get('host');

    // request.protocol honors X-Forwarded-Proto when trust proxy is set.
    if (
      isNonEmptyString(requestHost) &&
      normalizedOrigin === `${request.protocol}://${requestHost}`.toLowerCase()
    ) {
      return true;
    }

    return resolveAllowedCredentialedOrigins(this.twentyConfigService).has(
      normalizedOrigin,
    );
  }
}
