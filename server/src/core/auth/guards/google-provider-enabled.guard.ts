import { Injectable, CanActivate, NotFoundException } from '@nestjs/common';

import { Observable } from 'rxjs';

import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { GoogleStrategy } from 'src/core/auth/strategies/google.auth.strategy';

@Injectable()
export class GoogleProviderEnabledGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}
  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.environmentService.isAuthGoogleEnabled()) {
      throw new NotFoundException('Google auth is not enabled');
    }

    new GoogleStrategy(this.environmentService);
    return true;
  }
}
