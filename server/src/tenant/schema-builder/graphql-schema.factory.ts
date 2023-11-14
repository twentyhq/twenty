import { Injectable, Logger } from '@nestjs/common';

import { GraphQLSchema } from 'graphql';

import { ResolverBuilderMethods } from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';

import { TypeDefinitionsGenerator } from './type-definitions.generator';

import { BuildSchemaOptions } from './interfaces/build-schema-optionts.interface';
import { QueryTypeFactory } from './factories/query-type.factory';
import { MutationTypeFactory } from './factories/mutation-type.factory';
import { ObjectMetadataInterface } from './interfaces/object-metadata.interface';
import { OrphanedTypesFactory } from './factories/orphaned-types.factory';

@Injectable()
export class GraphQLSchemaFactory {
  private readonly logger = new Logger(GraphQLSchemaFactory.name);

  constructor(
    private readonly typeDefinitionsGenerator: TypeDefinitionsGenerator,
    private readonly queryTypeFactory: QueryTypeFactory,
    private readonly mutationTypeFactory: MutationTypeFactory,
    private readonly orphanedTypesFactory: OrphanedTypesFactory,
  ) {}

  async create(
    objectMetadataCollection: ObjectMetadataInterface[],
    resolverBuilderMethods: ResolverBuilderMethods,
    options: BuildSchemaOptions = {},
  ): Promise<GraphQLSchema> {
    // Generate type definitions
    this.typeDefinitionsGenerator.generate(objectMetadataCollection, options);

    // Generate schema
    const schema = new GraphQLSchema({
      query: this.queryTypeFactory.create(
        objectMetadataCollection,
        [...resolverBuilderMethods.queries],
        options,
      ),
      mutation: this.mutationTypeFactory.create(
        objectMetadataCollection,
        [...resolverBuilderMethods.mutations],
        options,
      ),
      types: this.orphanedTypesFactory.create(),
    });

    return schema;
  }
}
