import { isDefined } from 'twenty-shared/utils';
export const isArgDefinedIfProvidedOrThrow = ({
  input,
  key,
  value,
}: {
  input: object;
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}) => {
  if (key in input && !isDefined(value)) {
    throw new Error(`${key} must be defined when provided`);
  }
};
