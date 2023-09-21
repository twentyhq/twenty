import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import GraphQLJSON from 'graphql-type-json';
import { printSchema } from 'graphql';

import { AppService } from './app.service';

import { CoreModule } from './core/core.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './health/health.module';
import { AbilityModule } from './ability/ability.module';
import { TenantModule } from './tenant/tenant.module';
import { SchemaGenerationService } from './tenant/schema-generation/schema-generation.service';

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
        const service = AppModule.moduleRef.get(SchemaGenerationService, {
          strict: false,
        });
        const conditionalSchema = await service.generateSchema(
          'twenty-7ed9d212-1c25-4d02-bf25-6aeccf7ea419',
        );

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
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
    TenantModule,
  ],
  providers: [AppService],
})
export class AppModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    AppModule.moduleRef = this.moduleRef;
  }
}
