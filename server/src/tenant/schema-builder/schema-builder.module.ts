import { Module } from '@nestjs/common';

import { EntityResolverModule } from 'src/tenant/entity-resolver/entity-resolver.module';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { SchemaBuilderService } from './schema-builder.service';

@Module({
  imports: [EntityResolverModule],
  providers: [SchemaBuilderService, JwtAuthGuard],
  exports: [SchemaBuilderService],
})
export class SchemaBuilderModule {}
