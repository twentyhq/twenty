import { type NestExpressApplication } from '@nestjs/platform-express';
import {
  Test,
  type TestingModule,
  type TestingModuleBuilder,
} from '@nestjs/testing';

import bytes from 'bytes';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';

import { AppModule } from 'src/app.module';
import { settings } from 'src/engine/constants/settings';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { applyCredentialedCors } from 'src/engine/core-modules/user-session/utils/apply-credentialed-cors.util';
import { StripeSDKMockService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/mocks/stripe-sdk-mock.service';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { CaptchaDriverFactory } from 'src/engine/core-modules/captcha/captcha-driver.factory';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { ExceptionHandlerMockService } from 'src/engine/core-modules/exception-handler/mocks/exception-handler-mock.service';
import { JobsModule } from 'src/engine/core-modules/message-queue/jobs.module';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';

interface TestingModuleCreatePreHook {
  (moduleBuilder: TestingModuleBuilder): TestingModuleBuilder;
}

/**
 * Hook for adding items to nest application
 */
export type TestingAppCreatePreHook = (
  app: NestExpressApplication,
) => Promise<void>;

/**
 * Sets basic integration testing module of app
 */
export const createApp = async (
  config: {
    moduleBuilderHook?: TestingModuleCreatePreHook;
    appInitHook?: TestingAppCreatePreHook;
  } = {},
): Promise<NestExpressApplication> => {
  const stripeSDKMockService = new StripeSDKMockService();
  const mockExceptionHandlerService = new ExceptionHandlerMockService();
  let moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule, JobsModule, MessageQueueModule.registerExplorer()],
  })
    .overrideProvider(StripeSDKService)
    .useValue(stripeSDKMockService)
    .overrideProvider(ExceptionHandlerService)
    .useValue(mockExceptionHandlerService)
    .overrideProvider(CaptchaDriverFactory)
    .useValue({
      getCurrentDriver: () => ({
        validate: async () => ({ success: true }),
      }),
    });

  if (config.moduleBuilderHook) {
    moduleBuilder = config.moduleBuilderHook(moduleBuilder);
  }

  const moduleFixture: TestingModule = await moduleBuilder.compile();

  const app = moduleFixture.createNestApplication<NestExpressApplication>({
    rawBody: true,
  });

  // The production CORS setup, not the Nest wildcard default, so integration
  // tests exercise the credentialed-origin allowlist the deployment runs.
  applyCredentialedCors(app, app.get(TwentyConfigService));

  app.use(
    '/graphql',
    graphqlUploadExpress({
      maxFieldSize: bytes(settings.storage.maxFileSize)!,
      maxFiles: 10,
    }),
  );

  app.use(
    '/metadata',
    graphqlUploadExpress({
      maxFieldSize: bytes(settings.storage.maxFileSize)!,
      maxFiles: 10,
    }),
  );

  if (config.appInitHook) {
    await config.appInitHook(app);
  }

  await app.init();

  return app;
};
