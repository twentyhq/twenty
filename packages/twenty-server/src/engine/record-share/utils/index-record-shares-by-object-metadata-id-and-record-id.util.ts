import { isDefined } from 'twenty-shared/utils';

import { type RecordShare } from 'src/engine/record-share/types/record-share.type';

export const indexRecordSharesByObjectMetadataIdAndRecordId = (
  recordShares: RecordShare[],
): Map<string, Map<string, RecordShare[]>> => {
  const recordSharesByObjectMetadataIdAndRecordId = new Map<
    string,
    Map<string, RecordShare[]>
  >();

  for (const recordShare of recordShares) {
    let recordSharesByRecordId = recordSharesByObjectMetadataIdAndRecordId.get(
      recordShare.objectMetadataId,
    );

    if (!isDefined(recordSharesByRecordId)) {
      recordSharesByRecordId = new Map<string, RecordShare[]>();
      recordSharesByObjectMetadataIdAndRecordId.set(
        recordShare.objectMetadataId,
        recordSharesByRecordId,
      );
    }

    const recordSharesOfRecord = recordSharesByRecordId.get(
      recordShare.recordId,
    );

    if (isDefined(recordSharesOfRecord)) {
      recordSharesOfRecord.push(recordShare);
      continue;
    }

    recordSharesByRecordId.set(recordShare.recordId, [recordShare]);
  }

  return recordSharesByObjectMetadataIdAndRecordId;
};
