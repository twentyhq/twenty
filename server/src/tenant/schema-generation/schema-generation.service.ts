import { Injectable, InternalServerErrorException } from '@nestjs/common';

import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLSchema,
} from 'graphql';

import { EntityResolverService } from 'src/tenant/entity-resolver/entity-resolver.service';
import { DataSourceMetadataService } from 'src/tenant/metadata/data-source-metadata/data-source-metadata.service';
import { pascalCase } from 'src/utils/pascal-case';
import { ObjectMetadataService } from 'src/tenant/metadata/object-metadata/object-metadata.service';
import { ObjectMetadata } from 'src/tenant/metadata/object-metadata/object-metadata.entity';

import { generateEdgeType } from './graphql/edge.graphql-type';
import { generateConnectionType } from './graphql/connection.graphql-type';
import { generateObjectTypes } from './graphql/object.graphql-type';

@Injectable()
export class SchemaGenerationService {
  constructor(
    private readonly dataSourceMetadataService: DataSourceMetadataService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly entityResolverService: EntityResolverService,
  ) {}

  private generateQueryFieldForEntity(
    entityName: string,
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
      [`findAll${pascalCase(entityName)}`]: {
        type: ConnectionType,
        resolve: async (root, args, context, info: GraphQLResolveInfo) => {
          return this.entityResolverService.findAll(
            entityName,
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
            args,
            workspaceId,
            info,
            fieldAliases,
          );
        },
      },
    };
  }

  private generateQueryType(
    ObjectTypes: Record<string, GraphQLObjectType>,
    objectMetadata: ObjectMetadata[],
    workspaceId: string,
  ): GraphQLObjectType {
    const fields: any = {};

    for (const [entityName, ObjectType] of Object.entries(ObjectTypes)) {
      const objectDefinition = objectMetadata.find(
        (object) => object.displayName === entityName,
      );

      if (!objectDefinition) {
        throw new InternalServerErrorException('Object definition not found');
      }

      Object.assign(
        fields,
        this.generateQueryFieldForEntity(
          entityName,
          ObjectType,
          objectDefinition,
          workspaceId,
        ),
      );
    }

    return new GraphQLObjectType({
      name: 'Query',
      fields,
    });
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

    const ObjectTypes = generateObjectTypes(objectMetadata);
    const QueryType = this.generateQueryType(
      ObjectTypes,
      objectMetadata,
      workspaceId,
    );

    return new GraphQLSchema({
      query: QueryType,
    });
  }
}
