import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';

import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import GraphQLJSON from 'graphql-type-json';
import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  printSchema,
} from 'graphql';
import { EntitySchemaOptions } from 'typeorm';

import { AppService } from './app.service';

import { CoreModule } from './core/core.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './health/health.module';
import { AbilityModule } from './ability/ability.module';
import entityJson from './core/tenant/company-v2/company-v2.entity.json';

function generateGraphQLSchema(
  jsonSchema: EntitySchemaOptions<any>,
): GraphQLSchema {
  const entityName =
    jsonSchema.name.charAt(0).toUpperCase() + jsonSchema.name.slice(1);

  const fields: any = {};
  const enums: any = {};

  Object.entries(jsonSchema.columns).forEach(([columnName, columnDetails]) => {
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
        `${entityName}${
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

  const ObjectType = new GraphQLObjectType({
    name: entityName,
    fields,
  });

  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        [entityName.toLowerCase()]: { type: ObjectType },
      },
    }),
  });
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<YogaDriverConfig>({
      context: ({ req }) => ({ req }),
      driver: YogaDriver,
      autoSchemaFile: true,
      conditionalSchema: async (request) => {
        const conditionalSchema = generateGraphQLSchema(entityJson as any);

        console.log('conditionalSchema', printSchema(conditionalSchema));

        return conditionalSchema;
      },
      resolvers: { JSON: GraphQLJSON },
      plugins: [],
    }),
    PrismaModule,
    HealthModule,
    AbilityModule,
    IntegrationsModule,
    CoreModule,
  ],
  providers: [AppService],
})
export class AppModule {}
