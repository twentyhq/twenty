import { Injectable, InternalServerErrorException } from '@nestjs/common';

import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLSchema,
} from 'graphql';

import { EntityResolverService } from 'src/tenant/entity-resolver/entity-resolver.service';
import { DataSourceMetadataService } from 'src/metadata/data-source-metadata/data-source-metadata.service';
import { pascalCase } from 'src/utils/pascal-case';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { ObjectMetadata } from 'src/metadata/object-metadata/object-metadata.entity';

import { generateEdgeType } from './graphql-types/edge.graphql-type';
import { generateConnectionType } from './graphql-types/connection.graphql-type';
import {
  generateCreateInputType,
  generateObjectType,
  generateUpdateInputType,
} from './graphql-types/object.graphql-type';

@Injectable()
export class SchemaGenerationService {
  constructor(
    private readonly dataSourceMetadataService: DataSourceMetadataService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly entityResolverService: EntityResolverService,
  ) {}

  private generateQueryFieldForEntity(
    entityName: string,
    tableName: string,
    ObjectType: GraphQLObjectType,
    objectDefinition: ObjectMetadata,
    workspaceId: string,
  ) {
    const fieldAliases =
      objectDefinition?.fields.reduce(
        (acc, field) => ({
          ...acc,
          [field.displayName]: field.targetColumnName,
        }),
        {},
      ) || {};

    const EdgeType = generateEdgeType(ObjectType);
    const ConnectionType = generateConnectionType(EdgeType);

    return {
      [`findMany${pascalCase(entityName)}`]: {
        type: ConnectionType,
        resolve: async (root, args, context, info: GraphQLResolveInfo) => {
          return this.entityResolverService.findAll(
            entityName,
            tableName,
            workspaceId,
            info,
            fieldAliases,
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
            entityName,
            tableName,
            args,
            workspaceId,
            info,
            fieldAliases,
          );
        },
      },
    };
  }

  private generateMutationFieldForEntity(
    entityName: string,
    tableName: string,
    ObjectType: GraphQLObjectType,
    CreateInputType: GraphQLInputObjectType,
    UpdateInputType: GraphQLInputObjectType,
    objectDefinition: ObjectMetadata,
    workspaceId: string,
  ) {
    const fieldAliases =
      objectDefinition?.fields.reduce(
        (acc, field) => ({
          ...acc,
          [field.displayName]: field.targetColumnName,
        }),
        {},
      ) || {};

    return {
      [`createOne${pascalCase(entityName)}`]: {
        type: new GraphQLNonNull(ObjectType),
        args: {
          data: { type: new GraphQLNonNull(CreateInputType) },
        },
        resolve: (root, args, context, info) => {
          return this.entityResolverService.createOne(
            entityName,
            tableName,
            args,
            workspaceId,
            info,
            fieldAliases,
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
            entityName,
            tableName,
            args,
            workspaceId,
            info,
            fieldAliases,
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
            entityName,
            tableName,
            args,
            workspaceId,
            info,
            fieldAliases,
          );
        },
      },
    };
  }

  private generateQueryAndMutationTypes(
    objectMetadata: ObjectMetadata[],
    workspaceId: string,
  ): { query: GraphQLObjectType; mutation: GraphQLObjectType } {
    const queryFields: any = {};
    const mutationFields: any = {};

    for (const objectDefinition of objectMetadata) {
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
          workspaceId,
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
          workspaceId,
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
    workspaceId: string | undefined,
  ): Promise<GraphQLSchema> {
    if (!workspaceId) {
      return new GraphQLSchema({});
    }

    const dataSourcesMetadata =
      await this.dataSourceMetadataService.getDataSourcesMetadataFromWorkspaceId(
        workspaceId,
      );

    // Can'f find any data sources for this workspace
    if (!dataSourcesMetadata || dataSourcesMetadata.length === 0) {
      return new GraphQLSchema({});
    }

    const dataSourceMetadata = dataSourcesMetadata[0];

    const objectMetadata =
      await this.objectMetadataService.getObjectMetadataFromDataSourceId(
        dataSourceMetadata.id,
      );

    const { query, mutation } = this.generateQueryAndMutationTypes(
      objectMetadata,
      workspaceId,
    );

    return new GraphQLSchema({
      query,
      mutation,
    });
  }
}
