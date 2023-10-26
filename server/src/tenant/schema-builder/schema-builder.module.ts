import { Module } from '@nestjs/common';

import { EntityResolverModule } from 'src/tenant/entity-resolver/entity-resolver.module';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';

import { SchemaBuilderService } from './schema-builder.service';
import { TypeDefinitionsGenerator } from './type-definitions.generator';
import { GraphQLSchemaFactory } from './graphql-schema.factory';

import { schemaBuilderFactories } from './factories/factories';
import { TypeDefinitionsStorage } from './storages/type-definitions.storage';
import { TypeMapperService } from './services/type-mapper.service';

@Module({
  imports: [EntityResolverModule, ObjectMetadataModule],
  providers: [
    ...schemaBuilderFactories,
    TypeDefinitionsGenerator,
    TypeDefinitionsStorage,
    TypeMapperService,
    SchemaBuilderService,
    GraphQLSchemaFactory,
    JwtAuthGuard,
  ],
  exports: [SchemaBuilderService, GraphQLSchemaFactory],
})
export class SchemaBuilderModule {}
