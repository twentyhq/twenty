type InjectableWrapper = { instance: unknown };
type ContainerModule = { injectables: Map<unknown, InjectableWrapper> };

export const getAppInjectablesByClassName = <T>(className: string): T[] => {
  if (!global.app) {
    throw new Error(
      'global.app is not set: integration test globalSetup has not run',
    );
  }

  const container = (
    global.app as unknown as {
      container: { getModules: () => Map<string, ContainerModule> };
    }
  ).container;

  return [...container.getModules().values()].flatMap((containerModule) =>
    [...containerModule.injectables].flatMap(([token, wrapper]) =>
      typeof token === 'function' &&
      token.name === className &&
      Boolean(wrapper.instance)
        ? [wrapper.instance as T]
        : [],
    ),
  );
};
