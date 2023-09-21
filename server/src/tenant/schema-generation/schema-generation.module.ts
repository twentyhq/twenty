import { Module } from '@nestjs/common';

import { MorphResolverModule } from 'src/tenant/morph-resolver/morph-resolver.module';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { DataSourceMetadataModule } from 'src/tenant/metadata/data-source-metadata/data-source-metadata.module';
import { EntitySchemaGeneratorModule } from 'src/tenant/metadata/entity-schema-generator/entity-schema-generator.module';

import { SchemaGenerationService } from './schema-generation.service';
import { CustomContextCreator } from './custom-context.creator';

@Module({
  imports: [
    MorphResolverModule,
    DataSourceMetadataModule,
    EntitySchemaGeneratorModule,
  ],
  providers: [SchemaGenerationService, CustomContextCreator, JwtAuthGuard],
  exports: [SchemaGenerationService],
})
export class SchemaGenerationModule {}
