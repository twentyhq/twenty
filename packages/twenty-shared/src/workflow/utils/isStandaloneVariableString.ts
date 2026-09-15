export const isStandaloneVariableString = (value: unknown): value is string =>
  typeof value === 'string' && /^{{[^{}]+}}$/.test(value);
