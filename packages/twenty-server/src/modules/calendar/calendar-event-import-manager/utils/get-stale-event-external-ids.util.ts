type GetStaleEventExternalIdsArgs = {
  isFullSync: boolean;
  isPartial: boolean;
  existingEventExternalIds: string[];
  fetchedEventExternalIds: string[];
};

// A full sync only ever returns events that still exist: providers do not emit
// cancelled tombstones outside an active incremental sync-token chain, so an
// event deleted during a sync gap is silently absent rather than flagged.
// Reconcile by diffing what is already stored against what the full sync
// returned.
//
// A partial result is never reconcilable. CalDAV deliberately turns a single
// sub-calendar failure into an empty, successful-looking result so the rest of
// the account still syncs, which means an absent event may simply belong to
// the calendar that failed to fetch rather than having been deleted.
export const getStaleEventExternalIds = ({
  isFullSync,
  isPartial,
  existingEventExternalIds,
  fetchedEventExternalIds,
}: GetStaleEventExternalIdsArgs): string[] => {
  if (!isFullSync || isPartial) {
    return [];
  }

  const fetchedEventExternalIdsSet = new Set(fetchedEventExternalIds);

  return existingEventExternalIds.filter(
    (eventExternalId) => !fetchedEventExternalIdsSet.has(eventExternalId),
  );
};
