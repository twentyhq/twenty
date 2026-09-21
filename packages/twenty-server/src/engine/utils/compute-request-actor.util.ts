import { isDefined } from 'twenty-shared/utils';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';

export type RequestActor = {
  kind: 'apiKey' | 'application' | 'user';
  id: string;
};

export const computeRequestActor = (
  data: Pick<RawAuthContext, 'apiKey' | 'application' | 'user'>,
): RequestActor | undefined => {
  if (isDefined(data.apiKey)) {
    return { kind: 'apiKey', id: data.apiKey.id };
  }

  if (isDefined(data.application)) {
    return { kind: 'application', id: data.application.id };
  }

  if (isDefined(data.user)) {
    return { kind: 'user', id: data.user.id };
  }

  return undefined;
};
