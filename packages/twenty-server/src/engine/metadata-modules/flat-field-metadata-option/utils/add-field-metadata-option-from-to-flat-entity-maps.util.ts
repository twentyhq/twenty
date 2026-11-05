import { isDefined } from 'twenty-shared/utils';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFieldMetadataOption } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option.type';
import { type FlatFieldMetadataOptionMaps } from 'src/engine/metadata-modules/flat-field-metadata-option/types/flat-field-metadata-option-maps.type';
import { getTargetOptionColumnsByUniversalIdentifier } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/get-target-option-columns-by-universal-identifier.util';
import { isFieldMetadataOptionSyncSkipped } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/is-field-metadata-option-sync-skipped.util';
import { type FromToAllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';

// Synced fields can belong to any application, so each existing row keeps its owner.
export const addFieldMetadataOptionFromToFlatEntityMaps = ({
  fromToAllFlatEntityMaps,
  existingFlatFieldMetadataOptionMaps,
  applicationUniversalIdentifier,
}: {
  fromToAllFlatEntityMaps: FromToAllUniversalFlatEntityMaps;
  existingFlatFieldMetadataOptionMaps: FlatFieldMetadataOptionMaps;
  applicationUniversalIdentifier: string;
}): FromToAllUniversalFlatEntityMaps => {
  const fromToFlatFieldMetadataMaps =
    fromToAllFlatEntityMaps.flatFieldMetadataMaps;

  if (!isDefined(fromToFlatFieldMetadataMaps)) {
    return fromToAllFlatEntityMaps;
  }

  const syncedFieldMetadataUniversalIdentifiers = new Set([
    ...Object.keys(fromToFlatFieldMetadataMaps.from.byUniversalIdentifier),
    ...Object.keys(fromToFlatFieldMetadataMaps.to.byUniversalIdentifier),
  ]);

  const from: MetadataUniversalFlatEntityMaps<'fieldMetadataOption'> =
    createEmptyFlatEntityMaps();
  const existingOptionsByFieldMetadataUniversalIdentifier = new Map<
    string,
    FlatFieldMetadataOption[]
  >();

  for (const existingOption of Object.values(
    existingFlatFieldMetadataOptionMaps.byUniversalIdentifier,
  )) {
    if (
      !isDefined(existingOption) ||
      !syncedFieldMetadataUniversalIdentifiers.has(
        existingOption.fieldMetadataUniversalIdentifier,
      )
    ) {
      continue;
    }

    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: existingOption,
      universalFlatEntityMapsToMutate: from,
    });
    existingOptionsByFieldMetadataUniversalIdentifier.set(
      existingOption.fieldMetadataUniversalIdentifier,
      [
        ...(existingOptionsByFieldMetadataUniversalIdentifier.get(
          existingOption.fieldMetadataUniversalIdentifier,
        ) ?? []),
        existingOption,
      ],
    );
  }

  const to: MetadataUniversalFlatEntityMaps<'fieldMetadataOption'> =
    createEmptyFlatEntityMaps();
  const now = new Date().toISOString();

  for (const toFlatFieldMetadata of Object.values(
    fromToFlatFieldMetadataMaps.to.byUniversalIdentifier,
  )) {
    if (!isDefined(toFlatFieldMetadata)) {
      continue;
    }

    if (isFieldMetadataOptionSyncSkipped(toFlatFieldMetadata)) {
      for (const existingOption of existingOptionsByFieldMetadataUniversalIdentifier.get(
        toFlatFieldMetadata.universalIdentifier,
      ) ?? []) {
        addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
          universalFlatEntity: existingOption,
          universalFlatEntityMapsToMutate: to,
        });
      }
      continue;
    }

    for (const [
      universalIdentifier,
      optionColumns,
    ] of getTargetOptionColumnsByUniversalIdentifier(toFlatFieldMetadata)) {
      const existingOption =
        existingFlatFieldMetadataOptionMaps.byUniversalIdentifier[
          universalIdentifier
        ];

      // The field validator reports an option id reused across fields.
      if (
        isDefined(to.byUniversalIdentifier[universalIdentifier]) ||
        (isDefined(existingOption) &&
          existingOption.fieldMetadataUniversalIdentifier !==
            toFlatFieldMetadata.universalIdentifier)
      ) {
        continue;
      }

      addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
        universalFlatEntity: {
          universalIdentifier,
          applicationUniversalIdentifier:
            existingOption?.applicationUniversalIdentifier ??
            applicationUniversalIdentifier,
          fieldMetadataUniversalIdentifier:
            toFlatFieldMetadata.universalIdentifier,
          ...optionColumns,
          isActive: existingOption?.isActive ?? true,
          overrides: existingOption?.overrides ?? null,
          createdAt: existingOption?.createdAt ?? now,
          updatedAt: now,
        },
        universalFlatEntityMapsToMutate: to,
      });
    }
  }

  return {
    ...fromToAllFlatEntityMaps,
    flatFieldMetadataOptionMaps: { from, to },
  };
};
