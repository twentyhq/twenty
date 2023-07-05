import { Injectable, CanActivate, NotFoundException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class GoogleProviderEnabledGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}
  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.environmentService.getAuthGoogleEnabled()) {
      throw new NotFoundException('Google auth is not enabled');
    }
    return true;
  }
}
