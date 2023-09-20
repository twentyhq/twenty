import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';

import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { EntitySchemaColumnOptions } from 'typeorm';
import { EntitySchemaOptions } from 'typeorm/entity-schema/EntitySchemaOptions';

import { MorphResolverService } from 'src/morphs/morph-resolver/morph-resolver.service';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { CustomContextCreator } from './custom-context.creator';

@Injectable()
export class SchemaGenerationService {
  private entityName: string;

  constructor(
    private readonly customContextCreator: CustomContextCreator,
    private readonly authGuard: JwtAuthGuard,
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
    private readonly morphResolverService: MorphResolverService,
  ) {}

  test(): string {
    return 'Hello World!';
  }

  private async executeGuard(context: any) {
    const executionContext = this.customContextCreator.create(context);
    if (!(await this.authGuard.canActivate(executionContext))) {
      throw new UnauthorizedException('Not Authorized');
    }
  }

  private generateObjectType(columns: {
    [x: string]: EntitySchemaColumnOptions | undefined;
  }): GraphQLObjectType<any, any> {
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
          `${this.entityName}${
            columnName.charAt(0).toUpperCase() + columnName.slice(1)
          }Enum`;
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
      name: this.entityName,
      fields,
    });

    return ObjectType;
  }

  private generateQueryType(
    ObjectType: GraphQLObjectType<any, any>,
  ): GraphQLObjectType<any, any> {
    // const authGuard = this.moduleRef.get(JwtAuthGuard);

    const QueryType = new GraphQLObjectType({
      name: 'Query',
      fields: {
        [`findAll${this.entityName}`]: {
          type: new GraphQLList(ObjectType),
          resolve: async (root, args, context, info) => {
            // await this.executeGuard(context);
            // const authGuard = new JwtAuthGuard();
            // // const nestContext = this.moduleRef.get(ExecutionContext);

            // if (authGuard.canActivate(context)) {
            //   return this.morphResolverService.findAll(
            //     this.entityName,
            //     context,
            //   );
            // } else {
            //   throw new Error('Forbidden');
            // }
            console.log('morphResolverService: ', this.morphResolverService);
            return this.morphResolverService.findAll(this.entityName, context);
          },
        },
        [`findOne${this.entityName}`]: {
          type: ObjectType,
          args: {
            id: { type: new GraphQLNonNull(GraphQLID) },
          },
          resolve: (root, args, context, info) => {
            return this.morphResolverService.findOne(
              this.entityName,
              '',
              context,
            );
          },
        },
      },
    });

    return QueryType;
  }

  generateSchema(jsonSchema: EntitySchemaOptions<any>): GraphQLSchema {
    this.entityName =
      jsonSchema.name.charAt(0).toUpperCase() + jsonSchema.name.slice(1);

    const ObjectType = this.generateObjectType(jsonSchema.columns);
    const QueryType = this.generateQueryType(ObjectType);

    return new GraphQLSchema({
      query: QueryType,
    });
  }
}
