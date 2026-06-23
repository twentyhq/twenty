import { Injectable, type NestMiddleware } from '@nestjs/common';

import { type NextFunction, type Request, type Response } from 'express';

import {
  getHostnameFromUrlOrUndefined,
  isHostUnderPublicFunctionDomain,
} from 'src/engine/core-modules/domain/domain-server-config/utils/public-function-domain.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

// On the isolated public function domain (e.g. acme.withtwenty.com) logic
// functions are exposed at the root path, without the legacy /s/ prefix. This
// middleware transparently rewrites such requests onto the existing
// RouteTriggerController (@Controller('s')) so a single code path keeps serving
// them. Requests to the main app/API domain are left untouched.
@Injectable()
export class PublicFunctionDomainRewriteMiddleware implements NestMiddleware {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const publicDomainBaseHostname = getHostnameFromUrlOrUndefined(
      this.twentyConfigService.get('PUBLIC_DOMAIN_URL'),
    );

    const isPublicFunctionDomain = isHostUnderPublicFunctionDomain({
      host: req.headers.host,
      publicDomainBaseHostname,
    });

    const isAlreadyPrefixed = req.url === '/s' || req.url.startsWith('/s/');

    if (isPublicFunctionDomain && !isAlreadyPrefixed) {
      req.url = `/s${req.url}`;
    }

    next();
  }
}
