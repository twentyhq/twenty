import { Module } from '@nestjs/common';

import { CustomModule } from './custom/custom.module';
import { MetadataModule } from './metadata/metadata.module';

@Module({
  imports: [CustomModule, MetadataModule],
})
export class TenantModule {}
