import { Module } from '@nestjs/common';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';

import { TypeDefinitionsGenerator } from './type-definitions.generator';
import { GraphQLSchemaFactory } from './graphql-schema.factory';

import { schemaBuilderFactories } from './factories/factories';
import { TypeDefinitionsStorage } from './storages/type-definitions.storage';
import { TypeMapperService } from './services/type-mapper.service';

@Module({
  imports: [ObjectMetadataModule],
  providers: [
    ...schemaBuilderFactories,
    TypeDefinitionsGenerator,
    TypeDefinitionsStorage,
    TypeMapperService,
    GraphQLSchemaFactory,
    JwtAuthGuard,
  ],
  exports: [GraphQLSchemaFactory],
})
export class SchemaBuilderModule {}
