import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/connected-account/interceptors/connected-account-graphql-api-exception.interceptor';
import { ConnectedAccountResolver } from 'src/engine/metadata-modules/connected-account/resolvers/connected-account.resolver';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConnectedAccountEntity]),
    AuthModule,
    PermissionsModule,
    FeatureFlagModule,
  ],
  providers: [
    ConnectedAccountMetadataService,
    ConnectedAccountResolver,
    ConnectedAccountGraphqlApiExceptionInterceptor,
  ],
  exports: [ConnectedAccountMetadataService],
})
export class ConnectedAccountMetadataModule {}
