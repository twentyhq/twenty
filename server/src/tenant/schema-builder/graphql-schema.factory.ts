import { Injectable, Logger } from '@nestjs/common';

import { GraphQLSchema } from 'graphql';

import { ObjectMetadataService } from 'src/metadata/object-metadata/services/object-metadata.service';

import { TypeDefinitionsGenerator } from './type-definitions.generator';

import { BuildSchemaOptions } from './interfaces/build-schema-optionts.interface';
import { SchemaResolvers } from './interfaces/schema-resolvers.interface';
import { QueryTypeFactory } from './factories/query-type.factory';

@Injectable()
export class GraphQLSchemaFactory {
  private readonly logger = new Logger(GraphQLSchemaFactory.name);

  constructor(
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly typeDefinitionsGenerator: TypeDefinitionsGenerator,
    private readonly queryTypeFactory: QueryTypeFactory,
  ) {}

  async create(
    workspaceId: string,
    resolvers: SchemaResolvers,
    options: BuildSchemaOptions = {},
  ): Promise<GraphQLSchema> {
    // Get all objects from data source
    const objects =
      await this.objectMetadataService.getObjectMetadataFromWorkspaceId(
        workspaceId,
      );

    // Generate type definitions
    await this.typeDefinitionsGenerator.generate(objects, options);

    // Generate schema
    const schema = new GraphQLSchema({
      query: this.queryTypeFactory.create(objects, resolvers.query, options),
    });

    return schema;
  }
}
