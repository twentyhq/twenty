import { Module } from '@nestjs/common';

import { GoogleEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/google/google-email-alias-manager.service';
import { MicrosoftEmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/drivers/microsoft/microsoft-email-alias-manager.service';
import { EmailAliasManagerService } from 'src/modules/connected-account/email-alias-manager/services/email-alias-manager.service';
import { OAuth2ClientManagerModule } from 'src/modules/connected-account/oauth2-client-manager/oauth2-client-manager.module';
import { MicrosoftClientProvider } from 'src/modules/messaging/message-import-manager/drivers/microsoft/providers/microsoft-client.provider';

@Module({
  imports: [OAuth2ClientManagerModule],
  providers: [
    EmailAliasManagerService,
    GoogleEmailAliasManagerService,
    MicrosoftEmailAliasManagerService,
    MicrosoftClientProvider,
  ],
  exports: [EmailAliasManagerService],
})
export class EmailAliasManagerModule {}
