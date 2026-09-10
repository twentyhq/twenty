import { isDefined } from 'twenty-shared/utils';

import { type RecordShare } from 'src/engine/record-share/types/record-share.type';

export const indexRecordSharesByRecordId = (
  recordShares: RecordShare[],
): Map<string, RecordShare[]> => {
  const recordSharesByRecordId = new Map<string, RecordShare[]>();

  for (const recordShare of recordShares) {
    const recordSharesOfRecord = recordSharesByRecordId.get(
      recordShare.recordId,
    );

    if (isDefined(recordSharesOfRecord)) {
      recordSharesOfRecord.push(recordShare);
      continue;
    }

    recordSharesByRecordId.set(recordShare.recordId, [recordShare]);
  }

  return recordSharesByRecordId;
};
