import { YogaDriverConfig } from '@graphql-yoga/nestjs';
import { GraphQLError } from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { maskError } from 'graphql-yoga';

import { handleExceptionAndConvertToGraphQLError } from 'src/filters/utils/global-exception-handler.util';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { ExceptionHandlerService } from 'src/integrations/exception-handler/exception-handler.service';
import { MetadataModule } from 'src/metadata/metadata.module';
import { renderApolloPlayground } from 'src/workspace/utils/render-apollo-playground.util';

export const metadataModuleFactory = async (
  environmentService: EnvironmentService,
  exceptionHandlerService: ExceptionHandlerService,
): Promise<YogaDriverConfig> => {
  const config: YogaDriverConfig = {
    context: ({ req }) => ({ req }),
    autoSchemaFile: true,
    include: [MetadataModule],
    renderGraphiQL() {
      return renderApolloPlayground({ path: 'metadata' });
    },
    resolvers: { JSON: GraphQLJSON },
    plugins: [],
    path: '/metadata',
    maskedErrors: {
      maskError(error: GraphQLError, message, isDev) {
        if (error.originalError) {
          return handleExceptionAndConvertToGraphQLError(
            error.originalError,
            exceptionHandlerService,
          );
        }

        return maskError(error, message, isDev);
      },
    },
  };

  if (environmentService.isDebugMode()) {
    config.renderGraphiQL = () => {
      return renderApolloPlayground({ path: 'metadata' });
    };
  }

  return config;
};
