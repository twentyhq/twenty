import { YogaDriverConfig } from '@graphql-yoga/nestjs';
import GraphQLJSON from 'graphql-type-json';

import { TokenService } from 'src/core/auth/services/token.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { ExceptionHandlerService } from 'src/integrations/exception-handler/exception-handler.service';
import { useExceptionHandler } from 'src/integrations/exception-handler/hooks/use-exception-handler.hook';
import { MetadataModule } from 'src/metadata/metadata.module';
import { renderApolloPlayground } from 'src/workspace/utils/render-apollo-playground.util';

export const metadataModuleFactory = async (
  environmentService: EnvironmentService,
  exceptionHandlerService: ExceptionHandlerService,
  tokenService: TokenService,
): Promise<YogaDriverConfig> => {
  const config: YogaDriverConfig = {
    context: ({ req }) => ({ req }),
    autoSchemaFile: true,
    include: [MetadataModule],
    renderGraphiQL() {
      return renderApolloPlayground({ path: 'metadata' });
    },
    resolvers: { JSON: GraphQLJSON },
    plugins: [
      useExceptionHandler({
        exceptionHandlerService,
        tokenService,
      }),
    ],
    path: '/metadata',
  };

  if (environmentService.isDebugMode()) {
    config.renderGraphiQL = () => {
      return renderApolloPlayground({ path: 'metadata' });
    };
  }

  return config;
};
