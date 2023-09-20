import { Module } from '@nestjs/common';

import { MorphResolverModule } from 'src/morphs/morph-resolver/morph-resolver.module';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { SchemaGenerationService } from './schema-generation.service';
import { CustomContextCreator } from './custom-context.creator';

@Module({
  imports: [MorphResolverModule],
  providers: [SchemaGenerationService, CustomContextCreator, JwtAuthGuard],
  exports: [SchemaGenerationService],
})
export class SchemaGenerationModule {}
