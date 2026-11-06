export const assertNever = (_value: never, message?: string): never => {
  throw new Error(message ?? "Didn't expect to get here.");
};
