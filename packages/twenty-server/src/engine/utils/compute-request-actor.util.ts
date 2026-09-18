import { isDefined } from 'twenty-shared/utils';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';

export const computeRequestActor = (
  data: Pick<RawAuthContext, 'apiKey' | 'application' | 'user'>,
): string | undefined => {
  if (isDefined(data.apiKey)) {
    return `apiKey:${data.apiKey.id}`;
  }

  if (isDefined(data.application)) {
    return `application:${data.application.id}`;
  }

  if (isDefined(data.user)) {
    return `user:${data.user.id}`;
  }

  return undefined;
};
