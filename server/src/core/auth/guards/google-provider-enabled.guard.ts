import { Injectable, CanActivate, Inject, HttpException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

@Injectable()
export class GoogleProviderEnabledGuard implements CanActivate {
  constructor(private readonly environmentService: EnvironmentService) {}
  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (!this.environmentService.getAuthGoogleEnabled()) {
      throw new HttpException('Google auth is not enabled', 404);
    }
    return true;
  }
}
