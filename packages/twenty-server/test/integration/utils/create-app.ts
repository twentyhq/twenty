import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';

import { AppModule } from 'src/app.module';
import { StripeSDKMockService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/mocks/stripe-sdk-mock.service';
import { StripeSDKService } from 'src/engine/core-modules/billing/stripe/stripe-sdk/services/stripe-sdk.service';

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
  let moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(StripeSDKService)
    .useValue(stripeSDKMockService);

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
