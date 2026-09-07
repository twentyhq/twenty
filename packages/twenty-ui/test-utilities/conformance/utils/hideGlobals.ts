import { isDefined } from '@ui/utilities/utils/isDefined';

type HiddenGlobal = {
  globalName: string;
  descriptor: PropertyDescriptor | undefined;
};

const restoreGlobal = ({ globalName, descriptor }: HiddenGlobal) => {
  if (isDefined(descriptor)) {
    Object.defineProperty(globalThis, globalName, descriptor);

    return;
  }

  Reflect.deleteProperty(globalThis, globalName);
};

const hideGlobal = (globalName: string): HiddenGlobal => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, globalName);

  Object.defineProperty(globalThis, globalName, {
    configurable: true,
    writable: true,
    value: undefined,
  });

  return { globalName, descriptor };
};

export const hideGlobals = (globalNames: readonly string[]) => {
  const hiddenGlobals: HiddenGlobal[] = [];

  const restoreGlobals = () => {
    for (const hiddenGlobal of hiddenGlobals) {
      restoreGlobal(hiddenGlobal);
    }
  };

  try {
    for (const globalName of globalNames) {
      hiddenGlobals.push(hideGlobal(globalName));
    }
  } catch (error) {
    restoreGlobals();

    throw error;
  }

  return restoreGlobals;
};
