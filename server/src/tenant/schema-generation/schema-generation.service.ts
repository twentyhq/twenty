import { Injectable } from '@nestjs/common';

import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';

import { MorphResolverService } from 'src/tenant/morph-resolver/morph-resolver.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { DataSourceMetadataService } from 'src/tenant/metadata/data-source-metadata/data-source-metadata.service';
import { EntitySchemaGeneratorService } from 'src/tenant/metadata/entity-schema-generator/entity-schema-generator.service';
import { pascalCase } from 'src/utils/pascal-case';
import { ObjectMetadataService } from 'src/tenant/metadata/object-metadata/object-metadata.service';
import { ObjectMetadata } from 'src/tenant/metadata/object-metadata/object-metadata.entity';
import { FieldMetadata } from 'src/tenant/metadata/field-metadata/field-metadata.entity';

import { CustomContextCreator } from './custom-context.creator';

const PageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  fields: {
    startCursor: { type: GraphQLString },
    endCursor: { type: GraphQLString },
    hasNextPage: { type: new GraphQLNonNull(GraphQLBoolean) },
    hasPreviousPage: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
});

@Injectable()
export class SchemaGenerationService {
  constructor(
    private readonly dataSourceMetadataService: DataSourceMetadataService,
    private readonly entitySchemaGeneratorService: EntitySchemaGeneratorService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly customContextCreator: CustomContextCreator,
    private readonly authGuard: JwtAuthGuard,
    private readonly morphResolverService: MorphResolverService,
  ) {}

  private generateObjectType(
    name: string,
    columns: FieldMetadata[],
  ): GraphQLObjectType<any, any> {
    const fields: any = {
      id: {
        type: new GraphQLNonNull(GraphQLID),
      },
      createdAt: {
        type: new GraphQLNonNull(GraphQLString),
      },
      updatedAt: {
        type: new GraphQLNonNull(GraphQLString),
      },
    };
    // const enums: any = {};

    columns.forEach((column) => {
      let graphqlType: any;

      switch (column?.type) {
        case 'uuid':
          graphqlType = GraphQLID;
          break;
        case 'text':
        case 'url':
        case 'date':
          graphqlType = GraphQLString;
          break;
        case 'boolean':
          graphqlType = GraphQLBoolean;
          break;
        case 'number':
          graphqlType = GraphQLInt;
          break;
        default:
          graphqlType = GraphQLString;
      }

      // if (columnDetails?.enum) {
      //   const enumName =
      //     columnDetails.enumName ||
      //     `${pascalCase(name)}${pascalCase(columnName)}Enum`;
      //   enums[enumName] = new GraphQLEnumType({
      //     name: enumName,
      //     values: Object.fromEntries(
      //       Array.isArray(columnDetails.enum)
      //         ? columnDetails.enum.map((value: string) => [value, { value }])
      //         : [],
      //     ),
      //   });
      //   graphqlType = enums[enumName];
      // }

      // if (!columnDetails?.nullable) {
      graphqlType = new GraphQLNonNull(graphqlType);
      // }

      fields[column.displayName] = {
        type: graphqlType,
        description: column?.targetColumnName,
      };
    });

    // Dynamic object type
    const ObjectType = new GraphQLObjectType({
      name: pascalCase(name),
      fields,
    });

    return ObjectType;
  }

  private generateObjectTypes(objectMetadata: ObjectMetadata[]) {
    const objectTypes: Record<string, GraphQLObjectType> = {};

    for (const object of objectMetadata) {
      const ObjectType = this.generateObjectType(
        object.displayName,
        object.fields,
      );

      objectTypes[object.displayName] = ObjectType;
    }

    return objectTypes;
  }

  // Helper function to create an Edge type
  private generateEdgeType(
    ObjectType: GraphQLObjectType,
  ): GraphQLObjectType<any, any> {
    return new GraphQLObjectType({
      name: `${ObjectType.name}Edge`,
      fields: {
        node: {
          type: ObjectType,
        },
        cursor: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
    });
  }

  // Helper function to create a Connection type
  private generateConnectionType(
    EdgeType: GraphQLObjectType,
  ): GraphQLObjectType<any, any> {
    return new GraphQLObjectType({
      name: `${EdgeType.name.slice(0, -4)}Connection`, // Removing 'Edge' from the name
      fields: {
        edges: {
          type: new GraphQLList(EdgeType),
        },
        pageInfo: {
          type: new GraphQLNonNull(PageInfoType),
        },
      },
    });
  }

  private generateQueryType(
    ObjectTypes: Record<string, GraphQLObjectType>,
    objectMetadata: ObjectMetadata[],
    workspaceId: string,
  ): GraphQLObjectType<any, any> {
    // const authGuard = this.moduleRef.get(JwtAuthGuard);
    let fields: any = {};

    for (const [entityName, ObjectType] of Object.entries(ObjectTypes)) {
      const objectDefinition = objectMetadata.find(
        (object) => object.displayName === entityName,
      );
      console.log('objectDefinition', objectDefinition);
      const fieldAliases =
        objectDefinition?.fields.reduce(
          (acc, field) => ({
            ...acc,
            [field.displayName]: field.targetColumnName,
          }),
          {},
        ) ?? {};
      console.log('fieldAliases', fieldAliases);
      const EdgeType = this.generateEdgeType(ObjectType);
      const ConnectionType = this.generateConnectionType(EdgeType);

      fields = {
        ...fields,
        [`findAll${pascalCase(entityName)}`]: {
          type: ConnectionType,
          resolve: async (root, args, context, info: GraphQLResolveInfo) => {
            return this.morphResolverService.findAll(
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
            return this.morphResolverService.findOne(
              entityName,
              '',
              workspaceId,
            );
          },
        },
      };
    }

    const QueryType = new GraphQLObjectType({
      name: 'Query',
      fields,
    });

    return QueryType;
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

    // We can't use entities anymore because columns name are different from display names
    // const entities =
    //   await this.entitySchemaGeneratorService.getTypeORMEntitiesByDataSourceId(
    //     dataSourceMetadata.id,
    //   );

    const objectMetadata =
      await this.objectMetadataService.getObjectMetadataFromDataSourceId(
        dataSourceMetadata.id,
      );

    const ObjectTypes = this.generateObjectTypes(objectMetadata);
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
