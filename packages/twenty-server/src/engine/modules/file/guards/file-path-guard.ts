import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { TokenService } from 'src/engine/modules/auth/services/token.service';

@Injectable()
export class FilePathGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly environmentService: EnvironmentService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const query = context.switchToHttp().getRequest().query;

    if (query && query['token']) {
      return !(await this.isExpired(query['token']));
    }

    return true;
  }

  private async isExpired(signedExpirationDate: string): Promise<boolean> {
    const decodedPayload = await this.tokenService.decodePayload(
      signedExpirationDate,
      {
        secret: this.environmentService.get('FILE_TOKEN_SECRET'),
      },
    );

    const expirationDate = decodedPayload?.['expiration_date'];

    if (!expirationDate) {
      return true;
    }

    return new Date(expirationDate) < new Date();
  }
}
