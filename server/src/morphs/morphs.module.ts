import { Module } from '@nestjs/common';

import { SchemaGenerationModule } from './schema-generation/schema-generation.module';
import { MorphResolverModule } from './morph-resolver/morph-resolver.module';

@Module({
  imports: [SchemaGenerationModule, MorphResolverModule],
  exports: [SchemaGenerationModule],
})
export class MorphsModule {}
