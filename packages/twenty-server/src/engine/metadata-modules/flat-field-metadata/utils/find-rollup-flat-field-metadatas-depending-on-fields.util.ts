import { type FieldMetadataType } from 'twenty-shared/types';

import { getUniversalRollupSettingsFieldMetadataUniversalIdentifiers } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-universal-rollup-settings-field-metadata-universal-identifiers.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

type RollupDependencyNode = Pick<
  UniversalFlatFieldMetadata<FieldMetadataType.ROLLUP>,
  'universalIdentifier' | 'universalSettings'
>;

// A rollup can aggregate or filter on another rollup, so dependents are followed transitively
export const findRollupFlatFieldMetadatasDependingOnFields = <
  TRollup extends RollupDependencyNode,
>({
  fieldMetadataUniversalIdentifiers,
  rollupFlatFieldMetadatas,
}: {
  fieldMetadataUniversalIdentifiers: string[];
  rollupFlatFieldMetadatas: TRollup[];
}): TRollup[] => {
  const reachedUniversalIdentifiers = new Set(
    fieldMetadataUniversalIdentifiers,
  );
  const unreachedRollups = rollupFlatFieldMetadatas.filter(
    ({ universalIdentifier }) =>
      !reachedUniversalIdentifiers.has(universalIdentifier),
  );
  const directDependents = unreachedRollups.filter((rollup) =>
    getUniversalRollupSettingsFieldMetadataUniversalIdentifiers(
      rollup.universalSettings,
    ).some((universalIdentifier) =>
      reachedUniversalIdentifiers.has(universalIdentifier),
    ),
  );

  if (directDependents.length === 0) {
    return [];
  }

  return [
    ...directDependents,
    ...findRollupFlatFieldMetadatasDependingOnFields({
      fieldMetadataUniversalIdentifiers: [
        ...fieldMetadataUniversalIdentifiers,
        ...directDependents.map(
          ({ universalIdentifier }) => universalIdentifier,
        ),
      ],
      rollupFlatFieldMetadatas: unreachedRollups,
    }),
  ];
};
