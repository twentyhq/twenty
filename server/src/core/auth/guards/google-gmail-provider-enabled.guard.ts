import { Injectable, CanActivate, NotFoundException } from '@nestjs/common';

import { Observable } from 'rxjs';

import { GoogleGmailStrategy } from 'src/core/auth/strategies/google-gmail.auth.strategy';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class GoogleGmailProviderEnabledGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}

  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.environmentService.isMessagingProviderGmailEnabled()) {
      throw new NotFoundException('Gmail auth is not enabled');
    }

    new GoogleGmailStrategy(this.environmentService);

    return true;
  }
}
