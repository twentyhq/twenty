import { isNonEmptyString } from '@sniptt/guards';
import { ViewVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type ViewAudienceRecord = {
  visibility?: unknown;
  ownerUserWorkspaceId?: unknown;
};

export type ViewAudience =
  | { type: 'workspace' }
  | { type: 'users'; userWorkspaceIds: string[] };

export const resolveViewAudience = (
  record: ViewAudienceRecord | undefined,
): ViewAudience => {
  if (!isDefined(record)) {
    return { type: 'users', userWorkspaceIds: [] };
  }

  if (record.visibility === ViewVisibility.WORKSPACE) {
    return { type: 'workspace' };
  }

  return {
    type: 'users',
    userWorkspaceIds: isNonEmptyString(record.ownerUserWorkspaceId)
      ? [record.ownerUserWorkspaceId]
      : [],
  };
};

export const isSameViewAudience = (
  first: ViewAudience,
  second: ViewAudience,
): boolean =>
  first.type === 'workspace'
    ? second.type === 'workspace'
    : second.type === 'users' &&
      first.userWorkspaceIds.length === second.userWorkspaceIds.length &&
      first.userWorkspaceIds.every((userWorkspaceId) =>
        second.userWorkspaceIds.includes(userWorkspaceId),
      );
