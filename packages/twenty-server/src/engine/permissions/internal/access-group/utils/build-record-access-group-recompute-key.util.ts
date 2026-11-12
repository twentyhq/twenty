/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type RecomputeRecordAccessGroupIdsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-job-data.type';

// Also the deduplication id of the job: an object can have one recompute of its own and one propagated to it queued at once
export const buildRecordAccessGroupRecomputeKey = ({
  objectMetadataId,
  propagatedFromObjectMetadataIds,
}: Pick<
  RecomputeRecordAccessGroupIdsJobData,
  'objectMetadataId' | 'propagatedFromObjectMetadataIds'
>): string =>
  isNonEmptyArray(propagatedFromObjectMetadataIds)
    ? `${objectMetadataId}:propagated`
    : objectMetadataId;
