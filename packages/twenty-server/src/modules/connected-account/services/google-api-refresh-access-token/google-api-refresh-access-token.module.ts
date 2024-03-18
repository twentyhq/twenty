import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { GoogleAPIRefreshAccessTokenService } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.service';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';

@Module({
  imports: [
    ObjectMetadataRepositoryModule.forFeature([ConnectedAccountObjectMetadata]),
  ],
  providers: [GoogleAPIRefreshAccessTokenService],
  exports: [GoogleAPIRefreshAccessTokenService],
})
export class GoogleAPIRefreshAccessTokenModule {}
