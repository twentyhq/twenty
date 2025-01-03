import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';

import { AppModule } from 'src/app.module';
import { StripeService } from 'src/engine/core-modules/billing/stripe/stripe.service';

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
  let moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(StripeService)
    .useValue({
      constructEventFromPayload: (signature: string, payload: Buffer) => {
        if (signature === 'correct-signature') {
          const body = JSON.parse(payload.toString());

          return {
            type: body.type,
            data: body.data,
          };
        }
        throw new Error('Invalid signature');
      },
      updateCustomerMetadataWorkspaceId: (
        _customerId: string,
        _workspaceId: string,
      ) => {
        return;
      },
    });

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
