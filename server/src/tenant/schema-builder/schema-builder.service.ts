import { Injectable } from '@nestjs/common';

import {
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';
import upperFirst from 'lodash.upperfirst';

import { EntityResolverService } from 'src/tenant/entity-resolver/entity-resolver.service';
import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';

import { generateEdgeType } from './utils/generate-edge-type.util';
import { generateConnectionType } from './utils/generate-connection-type.util';
import { generateObjectType } from './utils/generate-object-type.util';
import { generateCreateInputType } from './utils/generate-create-input-type.util';
import { generateUpdateInputType } from './utils/generate-update-input-type.util';
import { SchemaBuilderContext } from './interfaces/schema-builder-context.interface';
import { cleanEntityName } from './utils/clean-entity-name.util';

@Injectable()
export class SchemaBuilderService {
  workspaceId: string;

  constructor(private readonly entityResolverService: EntityResolverService) {}

  private generateQueryFieldForEntity(
    entityName: {
      singular: string;
      plural: string;
    },
    tableName: string,
    ObjectType: GraphQLObjectType,
    objectDefinition: ObjectMetadata,
  ) {
    const schemaBuilderContext: SchemaBuilderContext = {
      tableName,
      workspaceId: this.workspaceId,
      fields: objectDefinition.fields,
    };

    const EdgeType = generateEdgeType(ObjectType);
    const ConnectionType = generateConnectionType(EdgeType);

    return {
      [`${entityName.plural}`]: {
        type: ConnectionType,
        resolve: async (root, args, context, info) => {
          return this.entityResolverService.findMany(
            schemaBuilderContext,
            info,
          );
        },
      },
      [`${entityName.singular}`]: {
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
    entityName: {
      singular: string;
      plural: string;
    },
    tableName: string,
    ObjectType: GraphQLObjectType,
    CreateInputType: GraphQLInputObjectType,
    UpdateInputType: GraphQLInputObjectType,
    objectDefinition: ObjectMetadata,
  ) {
    const schemaBuilderContext: SchemaBuilderContext = {
      tableName,
      workspaceId: this.workspaceId,
      fields: objectDefinition.fields,
    };

    return {
      [`createOne${upperFirst(entityName.singular)}`]: {
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
      [`createMany${upperFirst(entityName.singular)}`]: {
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
      [`updateOne${upperFirst(entityName.singular)}`]: {
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
      const entityName = {
        singular: cleanEntityName(objectDefinition.displayNameSingular),
        plural: cleanEntityName(objectDefinition.displayNamePlural),
      };

      const tableName = objectDefinition?.targetTableName ?? '';
      const ObjectType = generateObjectType(
        entityName.singular,
        objectDefinition.fields,
      );
      const CreateInputType = generateCreateInputType(
        entityName.singular,
        objectDefinition.fields,
      );
      const UpdateInputType = generateUpdateInputType(
        entityName.singular,
        objectDefinition.fields,
      );

      Object.assign(
        queryFields,
        this.generateQueryFieldForEntity(
          entityName,
          tableName,
          ObjectType,
          objectDefinition,
        ),
      );

      Object.assign(
        mutationFields,
        this.generateMutationFieldForEntity(
          entityName,
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
