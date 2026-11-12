/* @license Enterprise */

import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';

export type RecordShareCriteria = Partial<
  Pick<
    RecordShare,
    | 'objectMetadataId'
    | 'principalId'
    | 'principalType'
    | 'rowCause'
    | 'sourceId'
  >
> & {
  ids?: string[];
  recordIds?: string[];
};
