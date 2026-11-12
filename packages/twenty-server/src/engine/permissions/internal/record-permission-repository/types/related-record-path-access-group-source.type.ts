/* @license Enterprise */

import { type RelatedRecordPathHop } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';

export type RelatedRecordPathAccessGroupSource = {
  hops: RelatedRecordPathHop[];
  sourceObjectCompactIds: number[] | null;
  isSourcePrivacyApplicable: boolean;
};
