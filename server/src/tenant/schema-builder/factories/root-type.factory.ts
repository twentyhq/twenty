import { Injectable, Logger } from '@nestjs/common';

import { GraphQLFieldConfigMap, GraphQLObjectType } from 'graphql';

import { BuildSchemaOptions } from 'src/tenant/schema-builder/interfaces/build-schema-optionts.interface';
import { ResolverBuilderMethodNames } from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';
import { ObjectMetadataInterface } from 'src/tenant/schema-builder/interfaces/object-metadata.interface';

import { TypeDefinitionsStorage } from 'src/tenant/schema-builder/storages/type-definitions.storage';
import { getResolverName } from 'src/tenant/utils/get-resolver-name.util';
import { getResolverArgs } from 'src/tenant/schema-builder/utils/get-resolver-args.util';

import { ArgsFactory } from './args.factory';
import { ObjectTypeDefinitionKind } from './object-type-definition.factory';

export enum ObjectTypeName {
  Query = 'Query',
  Mutation = 'Mutation',
  Subscription = 'Subscription',
}

@Injectable()
export class RootTypeFactory {
  private readonly logger = new Logger(RootTypeFactory.name);

  constructor(
    private readonly typeDefinitionsStorage: TypeDefinitionsStorage,
    private readonly argsFactory: ArgsFactory,
  ) {}

  create(
    objectMetadataCollection: ObjectMetadataInterface[],
    resolverMethodNames: ResolverBuilderMethodNames[],
    objectTypeName: ObjectTypeName,
    options: BuildSchemaOptions,
  ): GraphQLObjectType {
    if (resolverMethodNames.length === 0) {
      this.logger.error(
        `No resolver methods were found for ${objectTypeName.toString()}`,
        {
          resolverMethodNames,
          objectTypeName,
          options,
        },
      );

      throw new Error(
        `No resolvers were found for ${objectTypeName.toString()}`,
      );
    }

    return new GraphQLObjectType({
      name: objectTypeName.toString(),
      fields: this.generateFields(
        objectMetadataCollection,
        resolverMethodNames,
        options,
      ),
    });
  }

  private generateFields<T = any, U = any>(
    objectMetadataCollection: ObjectMetadataInterface[],
    resolverMethodNames: ResolverBuilderMethodNames[],
    options: BuildSchemaOptions,
  ): GraphQLFieldConfigMap<T, U> {
    const fieldConfigMap: GraphQLFieldConfigMap<T, U> = {};

    for (const objectMetadata of objectMetadataCollection) {
      for (const methodName of resolverMethodNames) {
        const name = getResolverName(objectMetadata, methodName);
        const args = getResolverArgs(methodName);
        const outputType = this.typeDefinitionsStorage.getObjectTypeByKey(
          objectMetadata.id,
          methodName === 'findMany'
            ? ObjectTypeDefinitionKind.Connection
            : ObjectTypeDefinitionKind.Plain,
        );
        const argsType = this.argsFactory.create(
          {
            args,
            objectMetadata,
          },
          options,
        );

        if (!outputType) {
          this.logger.error(
            `Could not find a GraphQL type for ${objectMetadata.id} for method ${methodName}`,
            {
              objectMetadata,
              methodName,
              options,
            },
          );

          throw new Error(
            `Could not find a GraphQL type for ${objectMetadata.id} for method ${methodName}`,
          );
        }

        fieldConfigMap[name] = {
          type: outputType,
          args: argsType,
          resolve: undefined,
        };
      }
    }

    return fieldConfigMap;
  }
}
