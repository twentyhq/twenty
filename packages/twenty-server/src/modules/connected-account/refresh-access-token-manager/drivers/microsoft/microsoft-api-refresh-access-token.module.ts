import { Module } from '@nestjs/common';

import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { MicrosoftAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-access-token-manager/drivers/microsoft/services/microsoft-api-refresh-access-token.service';

@Module({
  imports: [EnvironmentModule],
  providers: [MicrosoftAPIRefreshAccessTokenService],
  exports: [MicrosoftAPIRefreshAccessTokenService],
})
export class MicrosoftAPIRefreshAccessTokenModule {}
