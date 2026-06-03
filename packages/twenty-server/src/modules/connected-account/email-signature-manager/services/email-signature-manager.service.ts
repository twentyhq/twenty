import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GoogleEmailSignatureManagerService } from 'src/modules/connected-account/email-signature-manager/drivers/google/services/google-email-signature-manager.service';

@Injectable()
export class EmailSignatureManagerService {
  constructor(
    private readonly googleEmailSignatureManagerService: GoogleEmailSignatureManagerService,
  ) {}

  // Returns the sender's signature for providers that expose one, else
  // undefined (no signature is appended for those providers).
  public async getSignature(
    connectedAccount: ConnectedAccountEntity,
  ): Promise<string | undefined> {
    switch (connectedAccount.provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.googleEmailSignatureManagerService.getSignature(
          connectedAccount,
        );
      case ConnectedAccountProvider.MICROSOFT:
      case ConnectedAccountProvider.IMAP_SMTP_CALDAV:
      case ConnectedAccountProvider.EMAIL_GROUP:
      case ConnectedAccountProvider.OIDC:
      case ConnectedAccountProvider.SAML:
      case ConnectedAccountProvider.APP:
        return undefined;
      default:
        return assertUnreachable(
          connectedAccount.provider,
          `Email signature manager for provider ${connectedAccount.provider} is not implemented`,
        );
    }
  }
}
