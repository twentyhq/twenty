import { Injectable } from '@nestjs/common';

import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { EntitySchema, EntitySchemaColumnOptions } from 'typeorm';

import { MorphResolverService } from 'src/tenant/morph-resolver/morph-resolver.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { DataSourceMetadataService } from 'src/tenant/metadata/data-source-metadata/data-source-metadata.service';
import { EntitySchemaGeneratorService } from 'src/tenant/metadata/entity-schema-generator/entity-schema-generator.service';
import { pascalCase } from 'src/utils/pascal-case';

import { CustomContextCreator } from './custom-context.creator';

@Injectable()
export class SchemaGenerationService {
  constructor(
    private readonly dataSourceMetadataService: DataSourceMetadataService,
    private readonly entitySchemaGeneratorService: EntitySchemaGeneratorService,
    private readonly customContextCreator: CustomContextCreator,
    private readonly authGuard: JwtAuthGuard,
    private readonly morphResolverService: MorphResolverService,
  ) {}

  private generateObjectType(
    name: string,
    columns: {
      [x: string]: EntitySchemaColumnOptions | undefined;
    },
  ): GraphQLObjectType<any, any> {
    const fields: any = {};
    const enums: any = {};

    Object.entries(columns).forEach(([columnName, columnDetails]) => {
      let graphqlType: any;

      switch (columnDetails?.type) {
        case 'uuid':
          graphqlType = GraphQLID;
          break;
        case 'text':
          graphqlType = GraphQLString;
          break;
        case 'timestamp':
          graphqlType = GraphQLString;
          break;
        default:
          graphqlType = GraphQLString;
      }

      if (columnDetails?.enum) {
        const enumName =
          columnDetails.enumName ||
          `${pascalCase(name)}${pascalCase(columnName)}Enum`;
        enums[enumName] = new GraphQLEnumType({
          name: enumName,
          values: Object.fromEntries(
            Array.isArray(columnDetails.enum)
              ? columnDetails.enum.map((value: string) => [value, { value }])
              : [],
          ),
        });
        graphqlType = enums[enumName];
      }

      if (!columnDetails?.nullable) {
        graphqlType = new GraphQLNonNull(graphqlType);
      }

      fields[columnName] = {
        type: graphqlType,
        description: columnDetails?.comment,
      };
    });

    // Dynamic object type
    const ObjectType = new GraphQLObjectType({
      name: pascalCase(name),
      fields,
    });

    return ObjectType;
  }

  private generateObjectTypes(
    entities: EntitySchema<{
      id: unknown;
      createdAt: unknown;
      updatedAt: unknown;
    }>[],
  ) {
    const objectTypes: Record<string, GraphQLObjectType> = {};

    for (const entity of entities) {
      const ObjectType = this.generateObjectType(
        entity.options.name,
        entity.options.columns,
      );

      objectTypes[entity.options.name] = ObjectType;
    }

    return objectTypes;
  }

  private generateQueryType(
    ObjectTypes: Record<string, GraphQLObjectType>,
    workspaceId: string,
  ): GraphQLObjectType<any, any> {
    // const authGuard = this.moduleRef.get(JwtAuthGuard);
    let fields: any = {};

    for (const [entityName, ObjectType] of Object.entries(ObjectTypes)) {
      fields = {
        ...fields,
        [`findAll${pascalCase(entityName)}`]: {
          type: new GraphQLList(ObjectType),
          resolve: async (root, args, context, info) => {
            console.log('morphResolverService: ', this.morphResolverService);
            return this.morphResolverService.findAll(entityName, workspaceId);
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

    const entities =
      await this.entitySchemaGeneratorService.getTypeORMEntitiesByDataSourceId(
        dataSourceMetadata.id,
      );

    const ObjectTypes = this.generateObjectTypes(entities);
    const QueryType = this.generateQueryType(ObjectTypes, workspaceId);

    return new GraphQLSchema({
      query: QueryType,
    });
  }
}
