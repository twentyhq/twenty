import { isDefined } from '@ui/utilities/utils/isDefined';

const restoreGlobal = (
  globalName: string,
  descriptor: PropertyDescriptor | undefined,
) => {
  if (isDefined(descriptor)) {
    Object.defineProperty(globalThis, globalName, descriptor);

    return;
  }

  Reflect.deleteProperty(globalThis, globalName);
};

export const hideGlobals = (globalNames: readonly string[]) => {
  const descriptors = globalNames.map((globalName) => ({
    globalName,
    descriptor: Object.getOwnPropertyDescriptor(globalThis, globalName),
  }));

  for (const { globalName } of descriptors) {
    Object.defineProperty(globalThis, globalName, {
      configurable: true,
      writable: true,
      value: undefined,
    });
  }

  return () => {
    for (const { globalName, descriptor } of descriptors) {
      restoreGlobal(globalName, descriptor);
    }
  };
};
