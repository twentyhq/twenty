import { ModulesContainer } from '@nestjs/core';

export const getAppProviderByClassName = <T>(className: string): T => {
  if (!global.app) {
    throw new Error(
      'global.app is not set: integration test globalSetup has not run',
    );
  }

  const modulesContainer = global.app.get(ModulesContainer);

  for (const containerModule of modulesContainer.values()) {
    for (const [token, wrapper] of containerModule.providers) {
      if (
        typeof token === 'function' &&
        token.name === className &&
        wrapper.instance
      ) {
        return wrapper.instance as T;
      }
    }
  }

  throw new Error(`Provider "${className}" not found in application container`);
};
