import { Module } from '@nestjs/common';

import { GoogleAPIRefreshAccessTokenModule } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/google-api-refresh-access-token.module';
import { MicrosoftAPIRefreshAccessTokenModule } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/microsoft-api-refresh-access-token.module';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

@Module({
  imports: [
    GoogleAPIRefreshAccessTokenModule,
    MicrosoftAPIRefreshAccessTokenModule,
  ],
  providers: [ConnectedAccountRefreshTokensService],
  exports: [ConnectedAccountRefreshTokensService],
})
export class RefreshTokensManagerModule {}
