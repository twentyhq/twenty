import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectionProviderModule } from 'src/engine/core-modules/application/connection-provider/connection-provider.module';
import { AppOAuthRefreshModule } from 'src/engine/core-modules/application/connection-provider/refresh/app-oauth-refresh.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountResolver } from 'src/engine/metadata-modules/connected-account/resolvers/connected-account.resolver';
import { ConnectedAccountOwnershipTransferService } from 'src/engine/metadata-modules/connected-account/services/connected-account-ownership-transfer.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { UserRoleModule } from 'src/engine/metadata-modules/user-role/user-role.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { WebhookSubscriptionModule } from 'src/modules/connected-account/webhook-subscription-manager/webhook-subscription.module';
import { ApplicationLookupModule } from 'src/engine/core-modules/application/application-lookup/application-lookup.module';
import { ApplicationRegistrationLookupModule } from 'src/engine/core-modules/application/application-registration/application-registration-lookup/application-registration-lookup.module';

@Module({
  imports: [
    ApplicationLookupModule,
    ApplicationRegistrationLookupModule,
    TypeOrmModule.forFeature([
      ConnectedAccountEntity,
      CalendarChannelEntity,
      MessageChannelEntity,
      UserWorkspaceEntity,
    ]),
    AppOAuthRefreshModule,
    ConnectionProviderModule,
    FeatureFlagModule,
    WebhookSubscriptionModule,
    PermissionsModule,
    UserRoleModule,
    WorkspaceEventEmitterModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    ConnectedAccountMetadataService,
    ConnectedAccountOwnershipTransferService,
    ConnectedAccountResolver,
  ],
  exports: [
    ConnectedAccountMetadataService,
    ConnectedAccountOwnershipTransferService,
  ],
})
export class ConnectedAccountMetadataModule {}
