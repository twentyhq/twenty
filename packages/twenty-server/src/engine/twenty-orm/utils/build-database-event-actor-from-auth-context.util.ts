import { isDefined } from 'twenty-shared/utils';

import type { DatabaseEventActor } from 'twenty-shared/database-events';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';

// A user acting through an application still counts as a user: the write is
// theirs, the application only carried it.
export const buildDatabaseEventActorFromAuthContext = (
  authContext: RawAuthContext | undefined,
): DatabaseEventActor => {
  if (isDefined(authContext?.user)) {
    return { type: 'user' };
  }

  if (isDefined(authContext?.apiKey)) {
    return { type: 'apiKey' };
  }

  if (isDefined(authContext?.application)) {
    return { type: 'application' };
  }

  return { type: 'system' };
};
