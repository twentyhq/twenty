export const blockInheritedMethods = ({
  instance,
  allowedMethods,
}: {
  instance: any;
  allowedMethods: Set<string>;
}) => {
  const prototype = Object.getPrototypeOf(instance);
  const parentPrototype = Object.getPrototypeOf(prototype);

  Object.getOwnPropertyNames(parentPrototype).forEach((prop) => {
    if (
      typeof parentPrototype[prop] === 'function' &&
      !allowedMethods.has(prop) &&
      prop !== 'constructor' &&
      !prop.startsWith('__')
    ) {
      (instance as any)[prop] = () => {
        throw new Error(
          `Cannot use unimplemented method ${prop}. Please use allowed methods or implement it including permission checks.`,
        );
      };
    }
  });
};
