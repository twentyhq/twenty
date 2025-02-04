import { Request } from 'express';

import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';

export class GraphqlTokenValidationProxy {
  private accessTokenService: AccessTokenService;

  constructor(accessTokenService: AccessTokenService) {
    this.accessTokenService = accessTokenService;
  }

  async validateToken(req: Request) {
    try {
      return await this.accessTokenService.validateTokenByRequest(req);
    } catch (error) {
      const authGraphqlApiExceptionFilter = new AuthGraphqlApiExceptionFilter();

      throw authGraphqlApiExceptionFilter.catch(error);
    }
  }
}
