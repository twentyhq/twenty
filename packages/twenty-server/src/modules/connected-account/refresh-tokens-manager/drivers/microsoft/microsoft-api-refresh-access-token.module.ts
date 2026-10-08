import { Module } from '@nestjs/common';

import { MicrosoftApiRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/services/microsoft-api-refresh-tokens.service';

@Module({
  providers: [MicrosoftApiRefreshAccessTokenService],
  exports: [MicrosoftApiRefreshAccessTokenService],
})
export class MicrosoftApiRefreshAccessTokenModule {}
