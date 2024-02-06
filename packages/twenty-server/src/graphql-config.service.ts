import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { GqlOptionsFactory } from '@nestjs/graphql';

import {
  YogaDriverConfig,
  YogaDriverServerContext,
} from '@graphql-yoga/nestjs';
import { GraphQLSchema, GraphQLError } from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { GraphQLSchemaWithContext, YogaInitialContext } from 'graphql-yoga';

import { TokenService } from 'src/core/auth/services/token.service';
import { CoreModule } from 'src/core/core.module';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { WorkspaceFactory } from 'src/workspace/workspace.factory';
import { ExceptionHandlerService } from 'src/integrations/exception-handler/exception-handler.service';
import { handleExceptionAndConvertToGraphQLError } from 'src/filters/utils/global-exception-handler.util';
import { renderApolloPlayground } from 'src/workspace/utils/render-apollo-playground.util';
import { EnvironmentService } from 'src/integrations/environment/environment.service';

import { useExceptionHandler } from './integrations/exception-handler/hooks/use-exception-handler.hook';
import { User } from './core/user/user.entity';

@Injectable()
export class GraphQLConfigService
  implements GqlOptionsFactory<YogaDriverConfig<'express'>>
{
  constructor(
    private readonly tokenService: TokenService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly environmentService: EnvironmentService,
    private readonly moduleRef: ModuleRef,
  ) {}

  createGqlOptions(): YogaDriverConfig {
    const isDebugMode = this.environmentService.isDebugMode();
    const config: YogaDriverConfig = {
      context: ({ req }) => ({ req }),
      autoSchemaFile: true,
      include: [CoreModule],
      conditionalSchema: async (context) => {
        let user: User | undefined;

        try {
          if (!this.tokenService.isTokenPresent(context.req)) {
            return new GraphQLSchema({});
          }

          const data = await this.tokenService.validateToken(context.req);

          user = data.user;

          return await this.createSchema(context, data.workspace);
        } catch (error) {
          if (error instanceof UnauthorizedException) {
            throw new GraphQLError('Unauthenticated', {
              extensions: {
                code: 'UNAUTHENTICATED',
              },
            });
          }

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

          throw handleExceptionAndConvertToGraphQLError(
            error,
            this.exceptionHandlerService,
            user
              ? {
                  id: user.id,
                  email: user.email,
                }
              : undefined,
          );
        }
      },
      resolvers: { JSON: GraphQLJSON },
      plugins: [
        useExceptionHandler({
          exceptionHandlerService: this.exceptionHandlerService,
          tokenService: this.tokenService,
        }),
      ],
    };

    if (isDebugMode) {
      config.renderGraphiQL = () => {
        return renderApolloPlayground();
      };
    }

    return config;
  }

  async createSchema(
    context: YogaDriverServerContext<'express'> & YogaInitialContext,
    workspace: Workspace,
  ): Promise<GraphQLSchemaWithContext<YogaDriverServerContext<'express'>>> {
    // Create a new contextId for each request
    const contextId = ContextIdFactory.create();

    // Register the request in the contextId
    this.moduleRef.registerRequestByContextId(context.req, contextId);

    // Resolve the WorkspaceFactory for the contextId
    const workspaceFactory = await this.moduleRef.resolve(
      WorkspaceFactory,
      contextId,
      {
        strict: false,
      },
    );

    return await workspaceFactory.createGraphQLSchema(workspace.id);
  }
}
