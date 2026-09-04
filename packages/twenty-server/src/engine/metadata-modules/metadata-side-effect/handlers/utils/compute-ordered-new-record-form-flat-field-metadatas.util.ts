import { getSystemFormFieldPageLayoutWidgetUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { computeRecordFormFlatFieldMetadatas } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-record-form-flat-field-metadatas.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

// Creations and updates are handled by two handlers but share one index space
// on the tab, so both must rank against the same ordered batch or they collide.
export const computeOrderedNewRecordFormFlatFieldMetadatas = ({
  objectMetadataUniversalIdentifier,
  labelIdentifierFieldMetadataUniversalIdentifier,
  recordFormPageLayoutTabUniversalIdentifier,
  allFlatEntityOperationRecordByMetadataName,
  flatPageLayoutWidgetMaps,
}: {
  objectMetadataUniversalIdentifier: string;
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
  recordFormPageLayoutTabUniversalIdentifier: string;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
} & Pick<
  AllFlatEntityMaps,
  'flatPageLayoutWidgetMaps'
>): UniversalFlatFieldMetadata[] => {
  const flatFieldMetadataOperations =
    allFlatEntityOperationRecordByMetadataName.fieldMetadata;

  const candidateFlatFieldMetadatas = [
    ...Object.values(flatFieldMetadataOperations?.flatEntityToCreate ?? {}),
    ...Object.values(flatFieldMetadataOperations?.flatEntityToUpdate ?? {}),
  ].filter(isDefined);

  const seenUniversalIdentifiers = new Set<string>();
  const objectFlatFieldMetadatas = candidateFlatFieldMetadatas.filter(
    (flatFieldMetadata) => {
      if (
        flatFieldMetadata.objectMetadataUniversalIdentifier !==
          objectMetadataUniversalIdentifier ||
        seenUniversalIdentifiers.has(flatFieldMetadata.universalIdentifier)
      ) {
        return false;
      }

      seenUniversalIdentifiers.add(flatFieldMetadata.universalIdentifier);

      return true;
    },
  );

  return computeRecordFormFlatFieldMetadatas({
    flatFieldMetadatas: objectFlatFieldMetadatas,
    labelIdentifierFieldMetadataUniversalIdentifier,
  }).filter(
    (eligibleFlatFieldMetadata) =>
      !isDefined(
        flatPageLayoutWidgetMaps.byUniversalIdentifier[
          getSystemFormFieldPageLayoutWidgetUniversalIdentifier({
            fieldMetadataApplicationUniversalIdentifier:
              eligibleFlatFieldMetadata.applicationUniversalIdentifier,
            pageLayoutTabUniversalIdentifier:
              recordFormPageLayoutTabUniversalIdentifier,
            fieldMetadataUniversalIdentifier:
              eligibleFlatFieldMetadata.universalIdentifier,
          })
        ],
      ),
  );
};
