import { Module } from '@nestjs/common';

import { ConnectedAccountDataAccessModule } from 'src/engine/metadata-modules/connected-account/data-access/connected-account-data-access.module';
import { GmailEmailAliasErrorHandlerService } from 'src/modules/connected-account/email-alias-manager/drivers/google/services/google-email-alias-error-handler.service';
import { GoogleEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/google/services/google-email-alias-manager.service';
import { MicrosoftEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/microsoft/services/microsoft-email-alias-manager.service';
import { EmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/services/email-alias-manager.service';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';

@Module({
  imports: [OAuth2ClientManagerModule, ConnectedAccountDataAccessModule],
  providers: [
    EmailAliasManagerService,
    GoogleEmailAliasManagerService,
    GmailEmailAliasErrorHandlerService,
    MicrosoftEmailAliasManagerService,
  ],
  exports: [EmailAliasManagerService],
})
export class EmailAliasManagerModule {}
