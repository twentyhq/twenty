import { Injectable, Logger } from '@nestjs/common';

import { GraphQLFieldConfigMap, GraphQLList, GraphQLObjectType } from 'graphql';

import {
  Resolver,
  ResolverMethodNames,
} from 'src/tenant/schema-builder/interfaces/schema-resolvers.interface';
import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';

import { IObjectMetadata } from 'src/tenant/schema-builder/metadata/object.metadata';
import { getResolverName } from 'src/tenant/schema-builder/utils/get-resolver-name.util';
import { TypeDefinitionsStorage } from 'src/tenant/schema-builder/storages/type-definitions.storage';
import { encodeTarget } from 'src/tenant/schema-builder/utils/target.util';

@Injectable()
export class RootTypeFactory {
  private readonly logger = new Logger(RootTypeFactory.name);

  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
  ) {}

  create(
    objects: IObjectMetadata[],
    resolvers: [ResolverMethodNames, Resolver][],
    objectTypeName: 'Subscription' | 'Mutation' | 'Query',
    options: BuildSchemaOptions,
  ): GraphQLObjectType {
    if (resolvers.length === 0) {
      this.logger.error(`No resolvers were found for ${objectTypeName}`, {
        objects,
        resolvers,
        objectTypeName,
        options,
      });

      throw new Error(
        `No resolvers were found for ${objectTypeName} ${objects.length}`,
      );
    }

    return new GraphQLObjectType({
      name: objectTypeName,
      fields: this.generateFields(objects, resolvers, options),
    });
  }

  private generateFields<T = any, U = any>(
    objects: IObjectMetadata[],
    resolvers: [ResolverMethodNames, Resolver][],
    options: BuildSchemaOptions,
  ): GraphQLFieldConfigMap<T, U> {
    const fieldConfigMap: GraphQLFieldConfigMap<T, U> = {};

    for (const metadata of objects) {
      for (const [key, resolver] of resolvers) {
        const target = encodeTarget({ id: metadata.id });
        const resolverName = getResolverName(metadata, key);
        const gqlType =
          this.typeDefinitionsStorage.getObjectTypeByTarget(target);

        if (!gqlType) {
          this.logger.error(
            `No gqlType was found for ${metadata.nameSingular} ${key}`,
            {
              metadata,
              resolvers,
              options,
            },
          );

          throw new Error(
            `No gqlType was found for ${metadata.nameSingular} ${key}`,
          );
        }

        fieldConfigMap[resolverName] = {
          // TODO: Generate relay connection type instead of list
          // It should be genearate inside typeDefinitionsStorage and then used here
          type: key === 'findMany' ? new GraphQLList(gqlType) : gqlType,
          args: {},
          resolve: resolver,
        };
      }
    }

    return fieldConfigMap;
  }
}
