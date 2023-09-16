import { Transform } from 'class-transformer';

export const CastToBoolean = () =>
  Transform(({ value }: { value: string }) => toBoolean(value));

const toBoolean = (value: any) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (['true', 'on', 'yes', '1'].includes(value.toLowerCase())) {
    return true;
  }
  if (['false', 'off', 'no', '0'].includes(value.toLowerCase())) {
    return false;
  }
  return undefined;
};
