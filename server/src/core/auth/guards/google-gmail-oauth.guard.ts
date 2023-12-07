import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleGmailOauthGuard extends AuthGuard('google-gmail') {
  constructor() {
    super({
      prompt: 'select_account',
    });
  }

  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const shortTermToken = request.query.shortTermToken;

      if (shortTermToken && typeof shortTermToken === 'string') {
        request.params.shortTermToken = shortTermToken;
      }
      const activate = (await super.canActivate(context)) as boolean;

      return activate;
    } catch (ex) {
      throw ex;
    }
  }
}
