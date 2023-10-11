import { Injectable, InternalServerErrorException } from '@nestjs/common';

import {
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';

import { EntityResolverService } from 'src/tenant/entity-resolver/entity-resolver.service';
import { pascalCase } from 'src/utils/pascal-case';
import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';

import { generateEdgeType } from './utils/generate-edge-type.util';
import { generateConnectionType } from './utils/generate-connection-type.util';
import { generateObjectType } from './utils/generate-object-type.util';
import { generateCreateInputType } from './utils/generate-create-input-type.util';
import { generateUpdateInputType } from './utils/generate-update-input-type.util';
import { SchemaBuilderContext } from './interfaces/schema-builder-context.interface';

@Injectable()
export class SchemaBuilderService {
  workspaceId: string;

  constructor(private readonly entityResolverService: EntityResolverService) {}

  private generateQueryFieldForEntity(
    entityName: string,
    tableName: string,
    ObjectType: GraphQLObjectType,
    objectDefinition: ObjectMetadata,
  ) {
    const fieldAliases =
      objectDefinition?.fields.reduce(
        (acc, field) => ({
          ...acc,
          [field.displayName]: field.targetColumnName,
        }),
        {},
      ) || {};
    const schemaBuilderContext: SchemaBuilderContext = {
      entityName,
      tableName,
      workspaceId: this.workspaceId,
      fieldAliases,
    };

    const EdgeType = generateEdgeType(ObjectType);
    const ConnectionType = generateConnectionType(EdgeType);

    return {
      [`findMany${pascalCase(entityName)}`]: {
        type: ConnectionType,
        resolve: async (root, args, context, info) => {
          return this.entityResolverService.findMany(
            schemaBuilderContext,
            info,
          );
        },
      },
      [`findOne${pascalCase(entityName)}`]: {
        type: ObjectType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: (root, args, context, info) => {
          return this.entityResolverService.findOne(
            args,
            schemaBuilderContext,
            info,
          );
        },
      },
    } as GraphQLFieldConfigMap<any, any>;
  }

  private generateMutationFieldForEntity(
    entityName: string,
    tableName: string,
    ObjectType: GraphQLObjectType,
    CreateInputType: GraphQLInputObjectType,
    UpdateInputType: GraphQLInputObjectType,
    objectDefinition: ObjectMetadata,
  ) {
    const fieldAliases =
      objectDefinition?.fields.reduce(
        (acc, field) => ({
          ...acc,
          [field.displayName]: field.targetColumnName,
        }),
        {},
      ) || {};
    const schemaBuilderContext: SchemaBuilderContext = {
      entityName,
      tableName,
      workspaceId: this.workspaceId,
      fieldAliases,
    };

    return {
      [`createOne${pascalCase(entityName)}`]: {
        type: new GraphQLNonNull(ObjectType),
        args: {
          data: { type: new GraphQLNonNull(CreateInputType) },
        },
        resolve: (root, args, context, info) => {
          return this.entityResolverService.createOne(
            args,
            schemaBuilderContext,
            info,
          );
        },
      },
      [`createMany${pascalCase(entityName)}`]: {
        type: new GraphQLList(ObjectType),
        args: {
          data: {
            type: new GraphQLNonNull(
              new GraphQLList(new GraphQLNonNull(CreateInputType)),
            ),
          },
        },
        resolve: (root, args, context, info) => {
          return this.entityResolverService.createMany(
            args,
            schemaBuilderContext,
            info,
          );
        },
      },
      [`updateOne${pascalCase(entityName)}`]: {
        type: new GraphQLNonNull(ObjectType),
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
          data: { type: new GraphQLNonNull(UpdateInputType) },
        },
        resolve: (root, args, context, info) => {
          return this.entityResolverService.updateOne(
            args,
            schemaBuilderContext,
            info,
          );
        },
      },
    } as GraphQLFieldConfigMap<any, any>;
  }

  private generateQueryAndMutationTypes(objectMetadata: ObjectMetadata[]): {
    query: GraphQLObjectType;
    mutation: GraphQLObjectType;
  } {
    const queryFields: any = {};
    const mutationFields: any = {};

    for (const objectDefinition of objectMetadata) {
      if (objectDefinition.fields.length === 0) {
        // A graphql type must define one or more fields
        continue;
      }

      const tableName = objectDefinition?.targetTableName ?? '';
      const ObjectType = generateObjectType(
        objectDefinition.displayName,
        objectDefinition.fields,
      );
      const CreateInputType = generateCreateInputType(
        objectDefinition.displayName,
        objectDefinition.fields,
      );
      const UpdateInputType = generateUpdateInputType(
        objectDefinition.displayName,
        objectDefinition.fields,
      );

      if (!objectDefinition) {
        throw new InternalServerErrorException('Object definition not found');
      }

      Object.assign(
        queryFields,
        this.generateQueryFieldForEntity(
          objectDefinition.displayName,
          tableName,
          ObjectType,
          objectDefinition,
        ),
      );

      Object.assign(
        mutationFields,
        this.generateMutationFieldForEntity(
          objectDefinition.displayName,
          tableName,
          ObjectType,
          CreateInputType,
          UpdateInputType,
          objectDefinition,
        ),
      );
    }

    return {
      query: new GraphQLObjectType({
        name: 'Query',
        fields: queryFields,
      }),
      mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: mutationFields,
      }),
    };
  }

  async generateSchema(
    workspaceId: string,
    objectMetadata: ObjectMetadata[],
  ): Promise<GraphQLSchema> {
    this.workspaceId = workspaceId;

    const { query, mutation } =
      this.generateQueryAndMutationTypes(objectMetadata);

    return new GraphQLSchema({
      query,
      mutation,
    });
  }
}
