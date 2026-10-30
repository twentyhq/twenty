/* @license Enterprise */

import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';
import { type RelatedRecordPathDTO } from 'src/engine/metadata-modules/related-record-path/dtos/related-record-path.dto';

export const fromFlatRelatedRecordPathToRelatedRecordPathDto = (
  flatRelatedRecordPath: FlatRelatedRecordPath,
): RelatedRecordPathDTO => ({
  id: flatRelatedRecordPath.id,
  objectMetadataId: flatRelatedRecordPath.objectMetadataId,
  firstFieldMetadataId: flatRelatedRecordPath.firstFieldMetadataId,
  secondFieldMetadataId: flatRelatedRecordPath.secondFieldMetadataId,
  thirdFieldMetadataId: flatRelatedRecordPath.thirdFieldMetadataId,
});
