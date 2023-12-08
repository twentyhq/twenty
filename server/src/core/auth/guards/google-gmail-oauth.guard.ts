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
      const transientToken = request.query.transientToken;

      if (transientToken && typeof transientToken === 'string') {
        request.params.transientToken = transientToken;
      }
      const activate = (await super.canActivate(context)) as boolean;

      return activate;
    } catch (ex) {
      throw ex;
    }
  }
}
