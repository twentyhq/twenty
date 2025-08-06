type AssertIsDefined = <T>(value: T) => asserts value is NonNullable<T>;

export const jestExpectToBeDefined: AssertIsDefined = <T>(value: T) => {
  expect(value).toBeDefined();
  expect(value).not.toBeNull();
};
