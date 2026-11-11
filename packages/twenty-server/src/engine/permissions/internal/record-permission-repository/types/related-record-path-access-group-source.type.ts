/* @license Enterprise */

import { type ResolvedRelatedRecordPath } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';

export type RelatedRecordPathAccessGroupSource = {
  resolvedPath: ResolvedRelatedRecordPath;
  // null when the path passes on every group of its source record
  sourceObjectCompactIds: number[] | null;
  isSourcePrivacyApplicable: boolean;
};
