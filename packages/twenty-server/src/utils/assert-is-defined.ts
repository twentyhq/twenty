const assertIsDefined = <T>(value: T | undefined): asserts value is T => {
  if (value === undefined) throw new Error('Value is undefined');
};

export const validator: { assertIsDefined: typeof assertIsDefined } = {
  assertIsDefined,
};
