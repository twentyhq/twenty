import { isDefined } from 'twenty-shared/utils';

export type RequestActor = {
  kind: 'apiKey' | 'application' | 'user';
  id: string;
};

type RequestActorCandidates = {
  apiKey?: { id: string } | null;
  application?: { id: string } | null;
  user?: { id: string } | null;
};

export const computeRequestActor = (
  data: RequestActorCandidates,
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
