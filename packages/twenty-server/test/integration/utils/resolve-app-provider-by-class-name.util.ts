import { isDefined } from 'twenty-shared/utils';

type ContainerModule = { providers: Map<unknown, unknown> };

export const resolveAppProviderByClassName = async <T>(
  className: string,
): Promise<T> => {
  if (!isDefined(global.app)) {
    throw new Error(
      'global.app is not set: integration test globalSetup has not run',
    );
  }

  const container = (
    global.app as unknown as {
      container: { getModules: () => Map<string, ContainerModule> };
    }
  ).container;

  for (const containerModule of container.getModules().values()) {
    for (const token of containerModule.providers.keys()) {
      if (typeof token === 'function' && token.name === className) {
        return global.app.resolve<T>(token);
      }
    }
  }

  throw new Error(`Provider "${className}" not found in application container`);
};
