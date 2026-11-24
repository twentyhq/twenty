/* @license Enterprise */

import { type FlatRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/types/flat-related-record-path.type';
import { resolveEffectiveRelatedRecordPath } from 'src/engine/metadata-modules/flat-related-record-path/utils/resolve-effective-related-record-path.util';
import { type RelatedRecordPathDTO } from 'src/engine/metadata-modules/related-record-path/dtos/related-record-path.dto';

export const fromFlatRelatedRecordPathToRelatedRecordPathDto = (
  flatRelatedRecordPath: FlatRelatedRecordPath,
): RelatedRecordPathDTO => {
  const effectiveFlatRelatedRecordPath = resolveEffectiveRelatedRecordPath(
    flatRelatedRecordPath,
  );

  return {
    id: effectiveFlatRelatedRecordPath.id,
    objectMetadataId: effectiveFlatRelatedRecordPath.objectMetadataId,
    firstFieldMetadataId: effectiveFlatRelatedRecordPath.firstFieldMetadataId,
    secondFieldMetadataId: effectiveFlatRelatedRecordPath.secondFieldMetadataId,
    thirdFieldMetadataId: effectiveFlatRelatedRecordPath.thirdFieldMetadataId,
    isInherent: effectiveFlatRelatedRecordPath.isInherent,
    isActive: effectiveFlatRelatedRecordPath.isActive,
  };
};
