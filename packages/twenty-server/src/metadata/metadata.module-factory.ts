import { YogaDriverConfig } from '@graphql-yoga/nestjs';
import GraphQLJSON from 'graphql-type-json';

import { CreateContextFactory } from 'src/graphql-config/factories/create-context.factory';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { ExceptionHandlerService } from 'src/integrations/exception-handler/exception-handler.service';
import { useExceptionHandler } from 'src/integrations/exception-handler/hooks/use-exception-handler.hook';
import { useThrottler } from 'src/integrations/throttler/hooks/use-throttler';
import { MetadataModule } from 'src/metadata/metadata.module';
import { renderApolloPlayground } from 'src/workspace/utils/render-apollo-playground.util';

export const metadataModuleFactory = async (
  environmentService: EnvironmentService,
  exceptionHandlerService: ExceptionHandlerService,
  createContextFactory: CreateContextFactory,
): Promise<YogaDriverConfig> => {
  const config: YogaDriverConfig = {
    context(context) {
      return createContextFactory.create(context);
    },
    autoSchemaFile: true,
    include: [MetadataModule],
    renderGraphiQL() {
      return renderApolloPlayground({ path: 'metadata' });
    },
    resolvers: { JSON: GraphQLJSON },
    plugins: [
      useThrottler({
        ttl: environmentService.getApiRateLimitingTtl(),
        limit: environmentService.getApiRateLimitingLimit(),
        identifyFn: (context) => {
          return context.user?.id ?? context.req.ip ?? 'anonymous';
        },
      }),
      useExceptionHandler({
        exceptionHandlerService,
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
