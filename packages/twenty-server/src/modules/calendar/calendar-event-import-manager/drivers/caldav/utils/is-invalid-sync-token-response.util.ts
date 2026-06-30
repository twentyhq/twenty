import { isNonEmptyString } from '@sniptt/guards';
import { type DAVResponse } from 'tsdav';
import { isDefined } from 'twenty-shared/utils';

export const isInvalidSyncTokenResponse = (
  responses: DAVResponse[],
): boolean => {
  const DAVResponse = responses[0];

  if (!isDefined(DAVResponse) || DAVResponse.status !== 403) return false;

  const body = isNonEmptyString(DAVResponse.raw)
    ? DAVResponse.raw
    : JSON.stringify(DAVResponse.raw ?? {});

  return body.includes('valid-sync-token') || body.includes('validSyncToken');
};
