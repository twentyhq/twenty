/* @license Enterprise */

// True when the waiting computes already hold the new ones in the same order, so running them covers both plans
export const areRecordAccessGroupComputesAlreadyPlanned = ({
  waitingObjectMetadataIds,
  objectMetadataIds,
}: {
  waitingObjectMetadataIds: string[];
  objectMetadataIds: string[];
}): boolean => {
  let nextWaitingIndex = 0;

  for (const objectMetadataId of objectMetadataIds) {
    const waitingIndex = waitingObjectMetadataIds.indexOf(
      objectMetadataId,
      nextWaitingIndex,
    );

    if (waitingIndex === -1) {
      return false;
    }

    nextWaitingIndex = waitingIndex + 1;
  }

  return true;
};
