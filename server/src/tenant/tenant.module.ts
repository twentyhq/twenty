import { Module } from '@nestjs/common';

import { MetadataModule } from './metadata/metadata.module';
import { UniversalModule } from './universal/universal.module';
import { SchemaGenerationModule } from './schema-generation/schema-generation.module';

@Module({
  imports: [MetadataModule, UniversalModule, SchemaGenerationModule],
})
export class TenantModule {}
