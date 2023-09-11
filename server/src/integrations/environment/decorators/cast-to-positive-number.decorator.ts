import { Transform } from 'class-transformer';

export function CastToPositiveNumber() {
  return Transform(({ value }: { value: string }) => toNumber(value));
}

const toNumber = (value: any) => {
  if (typeof value === 'number') {
    return value >= 0 ? value : undefined;
  }
  if (typeof value === 'string') {
    return isNaN(+value) ? undefined : toNumber(+value);
  }
  return undefined;
};
