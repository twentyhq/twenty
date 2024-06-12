import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
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
