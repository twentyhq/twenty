import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-side-effect.type';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import {
  computeValidationRulesAfterFieldChange,
  type ValidationRuleFieldChange,
} from 'src/engine/metadata-modules/validation-rule/utils/compute-validation-rules-after-field-change.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const buildValidationRulesAfterFieldChangeSideEffect = ({
  fieldChange,
  allFlatEntityOperationRecordByMetadataName,
  relatedFlatEntityMaps,
}: {
  fieldChange: ValidationRuleFieldChange;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  relatedFlatEntityMaps: MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect<'fieldMetadata'>;
}): MetadataSideEffectResult => {
  const objectMetadataOperations =
    allFlatEntityOperationRecordByMetadataName.objectMetadata;
  const flatObjectMetadataToUpdate: Record<
    string,
    UniversalFlatObjectMetadata
  > = {};

  for (const existingFlatObjectMetadata of Object.values(
    relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
  )) {
    if (!isDefined(existingFlatObjectMetadata)) {
      continue;
    }

    const { universalIdentifier } = existingFlatObjectMetadata;

    if (
      isDefined(
        objectMetadataOperations?.flatEntityToDelete[universalIdentifier],
      )
    ) {
      continue;
    }

    const flatObjectMetadata: UniversalFlatObjectMetadata =
      objectMetadataOperations?.flatEntityToUpdate[universalIdentifier] ??
      existingFlatObjectMetadata;

    const { validationRules, hasChanged } =
      computeValidationRulesAfterFieldChange({
        validationRules: flatObjectMetadata.validationRules ?? [],
        fieldChange,
      });

    if (hasChanged) {
      flatObjectMetadataToUpdate[universalIdentifier] = {
        ...flatObjectMetadata,
        validationRules,
      };
    }
  }

  if (Object.keys(flatObjectMetadataToUpdate).length === 0) {
    return { status: 'noop' };
  }

  return {
    status: 'success',
    operations: {
      objectMetadata: { flatEntityToUpdate: flatObjectMetadataToUpdate },
    },
  };
};
