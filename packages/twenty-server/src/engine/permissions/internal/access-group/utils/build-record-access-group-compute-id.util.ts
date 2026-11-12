/* @license Enterprise */

import { isNonEmptyArray } from 'twenty-shared/utils';

import { type RecomputeRecordAccessGroupIdsJobData } from 'src/engine/permissions/internal/access-group/types/recompute-record-access-group-ids-job-data.type';

// Also the deduplication id of the job: an object can have a direct compute and one from a related object queued at once
export const buildRecordAccessGroupComputeId = ({
  objectMetadataId,
  fromRelatedObjectMetadataIds,
}: Pick<
  RecomputeRecordAccessGroupIdsJobData,
  'objectMetadataId' | 'fromRelatedObjectMetadataIds'
>): string =>
  isNonEmptyArray(fromRelatedObjectMetadataIds)
    ? `${objectMetadataId}:from-related-object`
    : `${objectMetadataId}:direct`;
