export const assertUnreachable = (x: never, errorMessage?: string): never => {
  throw new Error(errorMessage ?? "Didn't expect to get here.");
};
