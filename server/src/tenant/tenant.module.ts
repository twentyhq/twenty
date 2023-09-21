import { Module } from '@nestjs/common';

import { MetadataModule } from './metadata/metadata.module';
import { UniversalModule } from './universal/universal.module';
import { MorphResolverModule } from './morph-resolver/morph-resolver.module';
import { SchemaGenerationModule } from './schema-generation/schema-generation.module';

@Module({
  imports: [
    MetadataModule,
    UniversalModule,
    MorphResolverModule,
    SchemaGenerationModule,
  ],
})
export class TenantModule {}
