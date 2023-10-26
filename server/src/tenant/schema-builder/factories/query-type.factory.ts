import { Injectable } from '@nestjs/common';

import { GraphQLObjectType } from 'graphql';

import {
  Resolver,
  ResolverMethodNames,
  SchemaQueryResolvers,
} from 'src/tenant/schema-builder/interfaces/schema-resolvers.interface';
import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';

import { IObjectMetadata } from 'src/tenant/schema-builder/metadata/object.metadata';

import { RootTypeFactory } from './root-type.factory';

@Injectable()
export class QueryTypeFactory {
  constructor(private readonly rootTypeFactory: RootTypeFactory) {}
  create(
    metadata: IObjectMetadata[],
    resolvers: SchemaQueryResolvers,
    options: BuildSchemaOptions,
  ): GraphQLObjectType {
    const objectTypeName = 'Query';

    return this.rootTypeFactory.create(
      metadata,
      Object.entries(resolvers) as [ResolverMethodNames, Resolver][],
      objectTypeName,
      options,
    );
  }
}
