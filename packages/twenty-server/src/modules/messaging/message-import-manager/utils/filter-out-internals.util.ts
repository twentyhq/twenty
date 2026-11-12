import { isDefined } from 'twenty-shared/utils';

import { getDomainFromEmailOrThrow } from 'src/utils/get-domain-from-email-or-throw';

type ItemWithParticipants = {
  participants?: { handle?: string | null }[] | null;
};

export const filterOutInternals = <TItem extends ItemWithParticipants>({
  primaryHandle,
  items,
}: {
  primaryHandle: string;
  items: TItem[];
}): TItem[] => {
  return items.filter((item) => {
    if (!isDefined(item.participants)) {
      return true;
    }

    const primaryHandleDomain = getDomainFromEmailOrThrow(primaryHandle);

    try {
      const isAllHandlesFromSameDomain = item.participants
        .filter((participant) => isDefined(participant.handle))
        .every(
          (participant) =>
            isDefined(participant.handle) &&
            getDomainFromEmailOrThrow(participant.handle) ===
              primaryHandleDomain,
        );

      if (isAllHandlesFromSameDomain) {
        return false;
      }
    } catch {
      return true;
    }

    return true;
  });
};
