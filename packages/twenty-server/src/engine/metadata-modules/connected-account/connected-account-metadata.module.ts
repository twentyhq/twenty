import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { CalendarChannelDataAccessModule } from 'src/engine/metadata-modules/calendar-channel/data-access/calendar-channel-data-access.module';
import { ConnectedAccountDataAccessModule } from 'src/engine/metadata-modules/connected-account/data-access/connected-account-data-access.module';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/connected-account/interceptors/connected-account-graphql-api-exception.interceptor';
import { ConnectedAccountResolver } from 'src/engine/metadata-modules/connected-account/resolvers/connected-account.resolver';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { MessageChannelDataAccessModule } from 'src/engine/metadata-modules/message-channel/data-access/message-channel-data-access.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConnectedAccountEntity]),
    CalendarChannelDataAccessModule,
    ConnectedAccountDataAccessModule,
    FeatureFlagModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    MessageChannelDataAccessModule,
    PermissionsModule,
  ],
  providers: [
    ConnectedAccountMetadataService,
    ConnectedAccountResolver,
    ConnectedAccountGraphqlApiExceptionInterceptor,
  ],
  exports: [ConnectedAccountMetadataService],
})
export class ConnectedAccountMetadataModule {}
