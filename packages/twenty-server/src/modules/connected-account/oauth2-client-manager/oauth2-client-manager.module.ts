import { Logger, Module } from '@nestjs/common';

import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { GoogleOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client-manager.service';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';

@Module({
  imports: [ConnectedAccountTokenEncryptionModule],
  providers: [
    OAuth2ClientManagerService,
    GoogleOAuth2ClientManagerService,
    MicrosoftOAuth2ClientManagerService,
    Logger,
  ],
  exports: [OAuth2ClientManagerService, MicrosoftOAuth2ClientManagerService],
})
export class OAuth2ClientManagerModule {}
