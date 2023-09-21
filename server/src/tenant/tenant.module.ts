import { Module } from '@nestjs/common';

import { MetadataModule } from './metadata/metadata.module';
import { UniversalModule } from './universal/universal.module';

@Module({
  imports: [MetadataModule, UniversalModule],
})
export class TenantModule {}
