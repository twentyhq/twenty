import { Logger, Module } from '@nestjs/common';

import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { GoogleOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/google/google-oauth2-client-manager.service';
import { MicrosoftOAuth2AuthProviderService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-auth-provider.service';
import { MicrosoftOAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/drivers/microsoft/microsoft-oauth2-client-manager.service';
import { OAuth2ClientManagerService } from 'src/modules/connected-account/oauth2-client-manager/services/oauth2-client-manager.service';

@Module({
  imports: [TwentyConfigModule, JwtModule, TwentyORMModule],
  providers: [
    OAuth2ClientManagerService,
    GoogleOAuth2ClientManagerService,
    MicrosoftOAuth2ClientManagerService,
    MicrosoftOAuth2AuthProviderService,
    Logger,
  ],
  exports: [OAuth2ClientManagerService, MicrosoftOAuth2ClientManagerService],
})
export class OAuth2ClientManagerModule {}
