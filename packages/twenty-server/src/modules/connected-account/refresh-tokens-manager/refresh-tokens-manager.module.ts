import { Module } from '@nestjs/common';

import { GoogleAPIRefreshAccessTokenModule } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/google-api-refresh-access-token.module';
import { MicrosoftAPIRefreshAccessTokenModule } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/microsoft-api-refresh-access-token.module';
import { RefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/refresh-tokens.service';

@Module({
  imports: [
    GoogleAPIRefreshAccessTokenModule,
    MicrosoftAPIRefreshAccessTokenModule,
  ],
  providers: [RefreshTokensService],
  exports: [RefreshTokensService],
})
export class RefreshTokensManagerModule {}
