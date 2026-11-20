/* @license Enterprise */

import { type RelatedRecordPathHop } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';

export type RelatedRecordPathAccessGroupSource = {
  hops: RelatedRecordPathHop[];
  // null when the path is inherent and passes on every group of the source
  sourceObjectMetadataId: string | null;
  isSourcePrivacyApplicable: boolean;
};
