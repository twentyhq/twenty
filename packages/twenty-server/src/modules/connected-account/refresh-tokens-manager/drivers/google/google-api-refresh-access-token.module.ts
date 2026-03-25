import { Module } from '@nestjs/common';

import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/services/google-api-refresh-tokens.service';

@Module({
  imports: [TwentyConfigModule],
  providers: [GoogleAPIRefreshAccessTokenService],
  exports: [GoogleAPIRefreshAccessTokenService],
})
export class GoogleAPIRefreshAccessTokenModule {}
