import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { RecordShareModule } from 'src/engine/record-share/record-share.module';
import { RecordShareResolver } from 'src/engine/record-share/record-share.resolver';
import { ManualRecordShareService } from 'src/engine/record-share/services/manual-record-share.service';
import { TwentyOrmModule } from 'src/engine/twenty-orm/twenty-orm.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    RecordShareModule,
    PermissionsModule,
    FeatureFlagModule,
    TwentyOrmModule,
    WorkspaceCacheModule,
  ],
  providers: [ManualRecordShareService, RecordShareResolver],
})
export class RecordShareMetadataModule {}
