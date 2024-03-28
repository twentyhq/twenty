/**
 * Returns a new object which is a subset of the input, including only the specified properties.
 * Can be called with a single argument (array of props to pick), in which case it returns a partially
 * applied pick function.
 */
export function pick<T extends string>(
  props: T[],
): <U>(input: U) => Pick<U, Extract<keyof U, T>>;
export function pick<U, T extends keyof U>(
  input: U,
  props: T[],
): { [K in T]: U[K] };
export function pick<U, T extends keyof U>(
  inputOrProps: U | T[],
  maybeProps?: T[],
): { [K in T]: U[K] } | ((input: U) => Pick<U, Extract<keyof U, T>>) {
  if (Array.isArray(inputOrProps)) {
    return (input: U) => _pick(input, inputOrProps);
  } else {
    return _pick(inputOrProps, maybeProps || []);
  }
}

function _pick<U, T extends keyof U>(input: U, props: T[]): { [K in T]: U[K] } {
  const output: any = {};

  for (const prop of props) {
    output[prop] = input[prop];
  }

  return output;
}
