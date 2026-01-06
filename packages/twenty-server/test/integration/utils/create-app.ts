import { APP_FILTER } from '@nestjs/core';
import { type NestExpressApplication } from '@nestjs/platform-express';
import {
  Test,
  type TestingModule,
  type TestingModuleBuilder,
} from '@nestjs/testing';

import { AppModule } from 'src/app.module';
import { CommandModule } from 'src/command/command.module';
import { StripeSDKMockService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/mocks/stripe-sdk-mock.service';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';
import { CAPTCHA_DRIVER } from 'src/engine/core-modules/captcha/constants/captcha-driver.constants';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { ExceptionHandlerMockService } from 'src/engine/core-modules/exception-handler/mocks/exception-handler-mock.service';
import { MockedUnhandledExceptionFilter } from 'src/engine/core-modules/exception-handler/mocks/mock-unhandled-exception.filter';
import { SyncDriver } from 'src/engine/core-modules/message-queue/drivers/sync.driver';
import { QUEUE_DRIVER } from 'src/engine/core-modules/message-queue/message-queue.constants';
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

// Shared SyncDriver instance for all queues in tests
// This enables synchronous processing of jobs during integration tests
const syncDriver = new SyncDriver();

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
    imports: [AppModule, CommandModule, MessageQueueModule.registerExplorer()],
    providers: [
      {
        provide: APP_FILTER,
        useClass: MockedUnhandledExceptionFilter,
      },
    ],
  })
    .overrideProvider(StripeSDKService)
    .useValue(stripeSDKMockService)
    .overrideProvider(ExceptionHandlerService)
    .useValue(mockExceptionHandlerService)
    .overrideProvider(CAPTCHA_DRIVER)
    .useValue({
      validate: async () => ({ success: true }),
    })
    .overrideProvider(QUEUE_DRIVER)
    .useValue(syncDriver);

  if (config.moduleBuilderHook) {
    moduleBuilder = config.moduleBuilderHook(moduleBuilder);
  }

  const moduleFixture: TestingModule = await moduleBuilder.compile();

  const app = moduleFixture.createNestApplication<NestExpressApplication>({
    rawBody: true,
    cors: true,
  });

  if (config.appInitHook) {
    await config.appInitHook(app);
  }

  await app.init();

  return app;
};
