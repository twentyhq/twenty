import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';
import { GraphQLError } from 'graphql';
import GraphQLJSON from 'graphql-type-json';
import { maskError } from 'graphql-yoga';

import { handleExceptionAndConvertToGraphQLError } from 'src/filters/utils/global-exception-handler.util';
import { ExceptionHandlerService } from 'src/integrations/exception-handler/exception-handler.service';
import { MetadataModule } from 'src/metadata/metadata.module';

export const metadataModuleFactory = async (
  exceptionHandlerService: ExceptionHandlerService,
): Promise<YogaDriverConfig> => ({
  context: ({ req }) => ({ req }),
  driver: YogaDriver,
  autoSchemaFile: true,
  include: [MetadataModule],
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
      } else {
        return maskError(error, message, isDev);
      }
    },
  },
});
