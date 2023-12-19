import { Abstract, Injectable, Type } from '@nestjs/common';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { FILTER_CATCH_EXCEPTIONS } from '@nestjs/common/constants';

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
import { exceptionFilters } from 'src/filters';
import { ExceptionHandlerService } from 'src/integrations/exception-handler/exception-handler.service';

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
          // Filter the exception
          this.filterException(error);

          // Send the unfiltered error to Sentry
          this.exceptionHandlerService.captureException(error);

          throw error;
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

    FILTER_CATCH_EXCEPTIONS;

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

  private filterException(error: unknown) {
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

    /**
     * Not really pretty but it works for now as we're outside of Nest.JS "flow" `APP_FILTER` is not triggered
     * Loop through all the exception filters and check if the error is instance of any of the metadata
     */
    for (const exceptionFilter of exceptionFilters) {
      // Extract the metadata from the exception filter
      const metadata: Array<Type<any> | Abstract<any>> | undefined =
        Reflect.getMetadata(FILTER_CATCH_EXCEPTIONS, exceptionFilter);

      if (!metadata) {
        continue;
      }

      // Loop through the metadata and check if the error is instance of any of the metadata
      for (const err of metadata) {
        // If the error is instance of the metadata, instantiate the exception filter and throw the error
        if (error instanceof err) {
          const filterInstance = new exceptionFilter(
            this.exceptionHandlerService,
          );

          throw filterInstance.catchException(error as any);
        }
      }
    }
  }
}
