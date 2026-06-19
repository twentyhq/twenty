import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { type Request } from 'express';

import { GooglePubSubPushVerifierService } from 'src/modules/connected-account-sync-webhooks/services/google-pubsub-push-verifier.service';

@Injectable()
export class GooglePushAuthGuard implements CanActivate {
  constructor(
    private readonly googlePubSubPushVerifierService: GooglePubSubPushVerifierService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    await this.googlePubSubPushVerifierService.verify(
      request.headers.authorization,
    );

    return true;
  }
}
