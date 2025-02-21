import { Module } from '@nestjs/common';

import { GoogleAPIRefreshAccessTokenModule } from 'src/modules/connected-account/refresh-access-token-manager/drivers/google/google-api-refresh-access-token.module';
import { MicrosoftAPIRefreshAccessTokenModule } from 'src/modules/connected-account/refresh-access-token-manager/drivers/microsoft/microsoft-api-refresh-access-token.module';
import { RefreshAccessTokenService } from 'src/modules/connected-account/refresh-access-token-manager/services/refresh-access-token.service';

@Module({
  imports: [
    GoogleAPIRefreshAccessTokenModule,
    MicrosoftAPIRefreshAccessTokenModule,
  ],
  providers: [RefreshAccessTokenService],
  exports: [RefreshAccessTokenService],
})
export class RefreshAccessTokenManagerModule {}
