import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { GoogleOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client.provider';
import { MicrosoftOAuth2ClientProvider } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client.provider';
import { RefreshTokensManagerModule } from 'src/modules/connected-account/refresh-tokens-manager/connected-account-refresh-tokens-manager.module';

@Module({
  imports: [
    ConnectedAccountTokenEncryptionModule,
    RefreshTokensManagerModule,
    TypeOrmModule.forFeature([ConnectedAccountEntity]),
  ],
  providers: [
    GoogleOAuth2ClientProvider,
    MicrosoftOAuth2ClientProvider,
    Logger,
  ],
  exports: [GoogleOAuth2ClientProvider, MicrosoftOAuth2ClientProvider],
})
export class OAuth2ClientManagerModule {}
