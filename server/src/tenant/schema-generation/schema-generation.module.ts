import { Module } from '@nestjs/common';

import { EntityResolverModule } from 'src/tenant/entity-resolver/entity-resolver.module';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { DataSourceMetadataModule } from 'src/tenant/metadata/data-source-metadata/data-source-metadata.module';
import { EntitySchemaGeneratorModule } from 'src/tenant/metadata/entity-schema-generator/entity-schema-generator.module';
import { ObjectMetadataModule } from 'src/tenant/metadata/object-metadata/object-metadata.module';

import { SchemaGenerationService } from './schema-generation.service';

@Module({
  imports: [
    EntityResolverModule,
    DataSourceMetadataModule,
    EntitySchemaGeneratorModule,
    ObjectMetadataModule,
  ],
  providers: [SchemaGenerationService, JwtAuthGuard],
  exports: [SchemaGenerationService],
})
export class SchemaGenerationModule {}
