type ProviderWrapper = { instance: unknown };
type ContainerModule = { providers: Map<unknown, ProviderWrapper> };

export const getAppProviderByClassName = <T>(className: string): T => {
  const container = (
    global.app as unknown as {
      container: { getModules: () => Map<string, ContainerModule> };
    }
  ).container;

  for (const containerModule of container.getModules().values()) {
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
