import { Injectable } from '@nestjs/common';

import { GraphQLObjectType } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';
import { ResolverBuilderQueryMethodNames } from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';
import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';

import { ObjectTypeName, RootTypeFactory } from './root-type.factory';

@Injectable()
export class QueryTypeFactory {
  constructor(private readonly rootTypeFactory: RootTypeFactory) {}
  create(
    objectMetadataCollection: ObjectMetadataInterface[],
    resolverMethodNames: ResolverBuilderQueryMethodNames[],
    options: BuildSchemaOptions,
  ): GraphQLObjectType {
    return this.rootTypeFactory.create(
      objectMetadataCollection,
      resolverMethodNames,
      ObjectTypeName.Query,
      options,
    );
  }
}
