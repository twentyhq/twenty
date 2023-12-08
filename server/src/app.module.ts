import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, ContextIdFactory, ModuleRef } from '@nestjs/core';

import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import GraphQLJSON from 'graphql-type-json';
import { GraphQLError, GraphQLSchema } from 'graphql';
import { ExtractJwt } from 'passport-jwt';
import { TokenExpiredError, JsonWebTokenError, verify } from 'jsonwebtoken';

import { WorkspaceFactory } from 'src/workspace/workspace.factory';
import { TypeOrmExceptionFilter } from 'src/filters/typeorm-exception.filter';
import { HttpExceptionFilter } from 'src/filters/http-exception.filter';
import { GlobalExceptionFilter } from 'src/filters/global-exception.filter';

import { AppService } from './app.service';

import { CoreModule } from './core/core.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { HealthModule } from './health/health.module';
import { WorkspaceModule } from './workspace/workspace.module';
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

          // If there is no token return an empty schema
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

          const contextId = ContextIdFactory.create();

          AppModule.moduleRef.registerRequestByContextId(request, contextId);

          // Get the SchemaGenerationService from the AppModule
          const workspaceFactory = await AppModule.moduleRef.resolve(
            WorkspaceFactory,
            contextId,
            {
              strict: false,
            },
          );

          return await workspaceFactory.createGraphQLSchema(workspace.id);
        } catch (error) {
          if (error instanceof JsonWebTokenError) {
            //mockedUserJWT
            throw new GraphQLError('Unauthenticated', {
              extensions: {
                code: 'UNAUTHENTICATED',
              },
            });
          }
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
    HealthModule,
    IntegrationsModule,
    CoreModule,
    WorkspaceModule,
  ],
  providers: [
    AppService,
    // Exceptions filters must be ordered from the least specific to the most specific
    // If TypeOrmExceptionFilter handle something, HttpExceptionFilter will not handle it
    // GlobalExceptionFilter will handle the rest of the exceptions
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: TypeOrmExceptionFilter,
    },
  ],
})
export class AppModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    AppModule.moduleRef = this.moduleRef;
  }
}
