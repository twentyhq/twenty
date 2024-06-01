import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { RefreshAccessTokenCronJob } from 'src/modules/connected-account/crons/jobs/refresh-access-token.cron.job';
import { GoogleAPIRefreshAccessTokenModule } from 'src/modules/connected-account/services/google-api-refresh-access-token/google-api-refresh-access-token.module';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    GoogleAPIRefreshAccessTokenModule,
    ObjectMetadataRepositoryModule.forFeature([
      ConnectedAccountWorkspaceEntity,
    ]),
  ],
  providers: [
    {
      provide: RefreshAccessTokenCronJob.name,
      useClass: RefreshAccessTokenCronJob,
    },
  ],
})
export class RefreshAccessTokenJobModule {}
