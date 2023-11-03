import { Injectable } from '@nestjs/common';

import { GraphQLObjectType } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';
import { ResolverBuilderMutationMethodNames } from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';
import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';

import { ObjectTypeName, RootTypeFactory } from './root-type.factory';

@Injectable()
export class MutationTypeFactory {
  constructor(private readonly rootTypeFactory: RootTypeFactory) {}
  create(
    objectMetadataCollection: ObjectMetadataInterface[],
    resolverMethodNames: ResolverBuilderMutationMethodNames[],
    options: BuildSchemaOptions,
  ): GraphQLObjectType {
    return this.rootTypeFactory.create(
      objectMetadataCollection,
      resolverMethodNames,
      ObjectTypeName.Mutation,
      options,
    );
  }
}
