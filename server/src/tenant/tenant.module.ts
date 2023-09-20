import { Module } from '@nestjs/common';

import { MetadataModule } from './metadata/metadata.module';
import { UniversalModule } from './custom/universal.module';

@Module({
  imports: [MetadataModule, UniversalModule],
})
export class TenantModule {}
