import { ModulesContainer } from '@nestjs/core';

export const getAppInjectablesByClassName = <T>(className: string): T[] => {
  if (!global.app) {
    throw new Error(
      'global.app is not set: integration test globalSetup has not run',
    );
  }

  const modulesContainer = global.app.get(ModulesContainer);

  return [...modulesContainer.values()].flatMap((containerModule) =>
    [...containerModule.injectables].flatMap(([token, wrapper]) =>
      typeof token === 'function' &&
      token.name === className &&
      Boolean(wrapper.instance)
        ? [wrapper.instance as T]
        : [],
    ),
  );
};
