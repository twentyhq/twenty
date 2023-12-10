import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';

import mockUser from 'test/mock-data/user.json';
import mockWorkspace from 'test/mock-data/workspace.json';
import { RequestHandler } from 'express';

import { AppModule } from 'src/app.module';

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
 * Sets basic e2e testing module of app
 */
export const createApp = async (
  config: {
    moduleBuilderHook?: TestingModuleCreatePreHook;
    appInitHook?: TestingAppCreatePreHook;
  } = {},
): Promise<[NestExpressApplication, TestingModule]> => {
  let moduleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule],
  });

  if (!!config.moduleBuilderHook) {
    moduleBuilder = config.moduleBuilderHook(moduleBuilder);
  }

  const moduleFixture: TestingModule = await moduleBuilder.compile();
  const app = moduleFixture.createNestApplication<NestExpressApplication>();

  if (config.appInitHook) {
    await config.appInitHook(app);
  }

  const mockAuthHandler: RequestHandler = (req, _res, next) => {
    req.user = {
      user: mockUser,
      workspace: mockWorkspace,
    };
    next();
  };

  app.use(mockAuthHandler);

  return [await app.init(), moduleFixture];
};
