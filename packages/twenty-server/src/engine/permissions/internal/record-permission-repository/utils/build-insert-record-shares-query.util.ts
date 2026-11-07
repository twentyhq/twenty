/* @license Enterprise */

import { type RecordPermissionQuery } from 'src/engine/permissions/internal/record-permission-repository/types/record-permission-query.type';
import { type RecordShareInput } from 'src/engine/permissions/record-share/types/record-share-input.type';

export const buildInsertRecordSharesQuery = ({
  recordShareTableExpression,
  recordShares,
  shouldIgnoreConflicts,
}: {
  recordShareTableExpression: string;
  recordShares: RecordShareInput[];
  shouldIgnoreConflicts: boolean;
}): RecordPermissionQuery => {
  const rows = recordShares.map(
    (_, index) =>
      `(:objectMetadataId${index}, :recordId${index}, :principalId${index}, :principalType${index}, :accessLevel${index}, :rowCause${index}, :sourceId${index})`,
  );

  return {
    sql: `INSERT INTO ${recordShareTableExpression} ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId") VALUES ${rows.join(', ')}${shouldIgnoreConflicts ? ' ON CONFLICT DO NOTHING' : ''}`,
    parameters: Object.fromEntries(
      recordShares.flatMap((recordShare, index) => [
        [`objectMetadataId${index}`, recordShare.objectMetadataId],
        [`recordId${index}`, recordShare.recordId],
        [`principalId${index}`, recordShare.principalId],
        [`principalType${index}`, recordShare.principalType],
        [`accessLevel${index}`, recordShare.accessLevel],
        [`rowCause${index}`, recordShare.rowCause],
        [`sourceId${index}`, recordShare.sourceId],
      ]),
    ),
  };
};
