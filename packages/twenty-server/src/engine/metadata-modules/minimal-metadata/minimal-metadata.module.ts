import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MinimalMetadataResolver } from 'src/engine/metadata-modules/minimal-metadata/minimal-metadata.resolver';
import { MinimalMetadataService } from 'src/engine/metadata-modules/minimal-metadata/minimal-metadata.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [FeatureFlagModule, WorkspaceCacheModule],
  providers: [MinimalMetadataResolver, MinimalMetadataService],
  exports: [MinimalMetadataService],
})
export class MinimalMetadataModule {}
