import * as jwt from 'jsonwebtoken';
import { isDefined } from 'twenty-shared/utils';

export const decodeJwtCompleteOrThrow = (token: string) => {
  const decoded = jwt.decode(token, { complete: true });

  if (!isDefined(decoded)) {
    throw new Error('Failed to decode JWT');
  }

  return decoded;
};
