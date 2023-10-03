import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';

import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import GraphQLJSON from 'graphql-type-json';
import { GraphQLError, GraphQLSchema } from 'graphql';
import { ExtractJwt } from 'passport-jwt';
import { TokenExpiredError, verify } from 'jsonwebtoken';

import { AppService } from './app.service';

import { CoreModule } from './core/core.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './health/health.module';
import { AbilityModule } from './ability/ability.module';
import { TenantModule } from './tenant/tenant.module';
import { SchemaGenerationService } from './tenant/schema-generation/schema-generation.service';
import { EnvironmentService } from './integrations/environment/environment.service';
import {
  JwtAuthStrategy,
  JwtPayload,
} from './core/auth/strategies/jwt.auth.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<YogaDriverConfig>({
      context: ({ req }) => ({ req }),
      driver: YogaDriver,
      autoSchemaFile: true,
      include: [CoreModule],
      conditionalSchema: async (request) => {
        try {
          // Get the SchemaGenerationService from the AppModule
          const service = AppModule.moduleRef.get(SchemaGenerationService, {
            strict: false,
          });

          // Get the JwtAuthStrategy from the AppModule
          const jwtStrategy = AppModule.moduleRef.get(JwtAuthStrategy, {
            strict: false,
          });

          // Get the EnvironmentService from the AppModule
          const environmentService = AppModule.moduleRef.get(
            EnvironmentService,
            {
              strict: false,
            },
          );

          // Extract JWT from the request
          const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request.req);

          // If there is no token, return an empty schema
          if (!token) {
            return new GraphQLSchema({});
          }

          // Verify and decode JWT
          const decoded = verify(
            token,
            environmentService.getAccessTokenSecret(),
          );

          // Validate JWT
          const { workspace } = await jwtStrategy.validate(
            decoded as JwtPayload,
          );

          const conditionalSchema = await service.generateSchema(workspace.id);

          return conditionalSchema;
        } catch (error) {
          if (error instanceof TokenExpiredError) {
            throw new GraphQLError('Unauthenticated', {
              extensions: {
                code: 'UNAUTHENTICATED',
              },
            });
          }
          throw error;
        }
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
