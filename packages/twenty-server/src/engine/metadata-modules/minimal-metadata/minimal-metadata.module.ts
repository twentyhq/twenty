import { Module } from '@nestjs/common';

import { PermissionsModule } from 'src/engine/permissions/permissions.module';

import { MinimalMetadataResolver } from 'src/engine/metadata-modules/minimal-metadata/minimal-metadata.resolver';
import { MinimalMetadataService } from 'src/engine/metadata-modules/minimal-metadata/minimal-metadata.service';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [WorkspaceCacheModule, PermissionsModule],
  providers: [MinimalMetadataResolver, MinimalMetadataService],
})
export class MinimalMetadataModule {}
