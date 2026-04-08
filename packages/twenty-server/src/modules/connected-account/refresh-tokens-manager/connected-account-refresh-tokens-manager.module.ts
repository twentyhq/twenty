import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { GoogleAPIRefreshAccessTokenModule } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/google-api-refresh-access-token.module';
import { MicrosoftAPIRefreshAccessTokenModule } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/microsoft-api-refresh-access-token.module';
import { ConnectedAccountRefreshTokensService } from 'src/modules/connected-account/refresh-tokens-manager/services/connected-account-refresh-tokens.service';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([ConnectedAccountEntity]),
    GoogleAPIRefreshAccessTokenModule,
    MicrosoftAPIRefreshAccessTokenModule,
  ],
  providers: [ConnectedAccountRefreshTokensService],
  exports: [ConnectedAccountRefreshTokensService],
})
export class RefreshTokensManagerModule {}
