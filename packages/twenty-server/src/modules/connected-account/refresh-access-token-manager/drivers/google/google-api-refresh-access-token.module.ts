import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/refresh-access-token-manager/drivers/google/services/google-api-refresh-access-token.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessagingCommonModule } from 'src/modules/messaging/common/messaging-common.module';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountWorkspaceEntity,
    ]),
    MessagingCommonModule,
  ],
  providers: [GoogleAPIRefreshAccessTokenService],
  exports: [GoogleAPIRefreshAccessTokenService],
})
export class GoogleAPIRefreshAccessTokenModule {}
