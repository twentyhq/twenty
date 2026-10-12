import { Module } from '@nestjs/common';

import { GoogleApiRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/services/google-api-refresh-tokens.service';

@Module({
  providers: [GoogleApiRefreshAccessTokenService],
  exports: [GoogleApiRefreshAccessTokenService],
})
export class GoogleApiRefreshAccessTokenModule {}
