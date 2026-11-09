import { isNonEmptyString } from '@sniptt/guards';

// The query compiler applies this group only; any other parentless group is ignored
export const findRootRecordFilterGroup = <
  TRecordFilterGroup extends { parentRecordFilterGroupId?: string | null },
>(
  recordFilterGroups: TRecordFilterGroup[],
): TRecordFilterGroup | undefined =>
  recordFilterGroups.find(
    ({ parentRecordFilterGroupId }) =>
      !isNonEmptyString(parentRecordFilterGroupId),
  );
