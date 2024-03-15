import { createHash } from 'crypto';

export const createDeterministicUuid = (inputUuid: string): string => {
  const hash = createHash('sha256').update(inputUuid).digest('hex');

  return `20202020-${hash.substring(0, 4)}-4${hash.substring(
    4,
    7,
  )}-8${hash.substring(7, 10)}-${hash.substring(10, 22)}`;
};
