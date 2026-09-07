import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { findBackfillSharingRulesAfterOperations } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/find-backfill-sharing-rules-after-operations.util';
import { findFlatObjectMetadataAfterOperations } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/find-flat-object-metadata-after-operations.util';
import { getEffectiveReadability } from 'src/engine/metadata-modules/object-metadata/utils/get-effective-readability.util';

// The last backfill rule of a PRIVATE object is the only thing keeping its
// records readable, so the migration removing it must also move the object off
// PRIVATE. Returns the label to name in the refusal, nothing when the
// operations keep a backfill rule or the object never had one.
export const resolveLastBackfillSharingRuleRemoval = ({
  sharingRuleUniversalIdentifier,
  flatSharingRuleMaps,
  flatObjectMetadataMaps,
  allFlatEntityOperationRecordByMetadataName,
}: {
  sharingRuleUniversalIdentifier: string;
  allFlatEntityOperationRecordByMetadataName: Partial<AllFlatEntityOperationRecordByMetadataName>;
} & Pick<AllFlatEntityMaps, 'flatSharingRuleMaps' | 'flatObjectMetadataMaps'>):
  | { objectLabelPlural: string }
  | undefined => {
  const existingFlatSharingRule =
    flatSharingRuleMaps.byUniversalIdentifier[sharingRuleUniversalIdentifier];

  if (!isDefined(existingFlatSharingRule)) {
    return undefined;
  }

  const { objectMetadataUniversalIdentifier } = existingFlatSharingRule;
  const flatObjectMetadataAfterOperations =
    findFlatObjectMetadataAfterOperations({
      objectMetadataUniversalIdentifier,
      flatObjectMetadataMaps,
      allFlatEntityOperationRecordByMetadataName,
    });

  if (
    !isDefined(flatObjectMetadataAfterOperations) ||
    getEffectiveReadability(flatObjectMetadataAfterOperations) !==
      MetadataReadability.PRIVATE
  ) {
    return undefined;
  }

  const hadBackfillSharingRule =
    findBackfillSharingRulesAfterOperations({
      objectMetadataUniversalIdentifier,
      flatSharingRuleMaps,
    }).length > 0;
  const keepsBackfillSharingRule =
    findBackfillSharingRulesAfterOperations({
      objectMetadataUniversalIdentifier,
      flatSharingRuleMaps,
      allFlatEntityOperationRecordByMetadataName,
    }).length > 0;

  return hadBackfillSharingRule && !keepsBackfillSharingRule
    ? { objectLabelPlural: flatObjectMetadataAfterOperations.labelPlural }
    : undefined;
};
