import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

import { TokenService } from 'src/engine/modules/auth/services/token.service';

@Injectable()
export class FilePathGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const query = context.switchToHttp().getRequest().query;

    if (query && query['token']) {
      return !(await this.isExpired(query['token']));
    }

    return true;
  }

  private async isExpired(signedExpirationDate: string): Promise<boolean> {
    const decodedPayload =
      await this.tokenService.decodePayload(signedExpirationDate);

    const expirationDate = decodedPayload?.['expiration_date'];

    if (!expirationDate) {
      return true;
    }

    return new Date(expirationDate) < new Date();
  }
}
