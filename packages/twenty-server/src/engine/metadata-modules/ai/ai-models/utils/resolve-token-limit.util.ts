import { isDefined } from 'twenty-shared/utils';

// Limits persisted as 0 or a negative number, either by earlier versions of the
// admin panel or by a hand-edited config, would make the model unusable.
export const resolveTokenLimit = (
  limit: number | undefined,
  fallback: number,
): number => (isDefined(limit) && limit > 0 ? limit : fallback);
