import { Injectable } from '@nestjs/common';
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
import { globalExceptionHandler } from 'src/filters/utils/global-exception-handler.util';

@Injectable()
export class GraphQLConfigService
  implements GqlOptionsFactory<YogaDriverConfig<'express'>>
{
  constructor(
    private readonly tokenService: TokenService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly moduleRef: ModuleRef,
  ) {}

  createGqlOptions(): YogaDriverConfig {
    return {
      context: ({ req }) => ({ req }),
      autoSchemaFile: true,
      include: [CoreModule],
      conditionalSchema: async (context) => {
        try {
          let workspace: Workspace;

          // If token is not valid, it will return an empty schema
          try {
            workspace = await this.tokenService.validateToken(context.req);
          } catch (err) {
            return new GraphQLSchema({});
          }

          return await this.createSchema(context, workspace);
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

          throw globalExceptionHandler(error, this.exceptionHandlerService);
        }
      },
      resolvers: { JSON: GraphQLJSON },
      plugins: [],
    };
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
