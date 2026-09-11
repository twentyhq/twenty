import { type AllMetadataName } from 'twenty-shared/metadata';
import { fastDeepEqual } from 'twenty-shared/utils';

import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/overrides/constants/all-overridable-properties-by-metadata-name.constant';
import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';
import {
  type OverridableFlatEntity,
  resolveEffectiveFlatEntityProperty,
} from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

const OVERRIDES_PROPERTIES = ['overrides', 'universalOverrides'];

// What an update changes from the reader's point of view: the raw properties
// it carries, plus every overridable property whose effective value differs
// once the new overrides apply, and translations when they differ. A guard
// keyed on raw update keys would let an override through unseen, or refuse
// one that only changes what the guard allows.
export const computeEffectiveUpdatedProperties = <
  TFlatEntity extends OverridableFlatEntity & Record<string, unknown>,
>({
  metadataName,
  existingFlatEntity,
  flatEntityUpdate,
}: {
  metadataName: AllMetadataName;
  existingFlatEntity: TFlatEntity;
  flatEntityUpdate: Partial<TFlatEntity>;
}): string[] => {
  const updatedFlatEntity = { ...existingFlatEntity, ...flatEntityUpdate };
  const authorContext = {
    ownerApplicationUniversalIdentifier:
      existingFlatEntity.applicationUniversalIdentifier,
  };

  const rawProperties = Object.keys(flatEntityUpdate).filter(
    (property) => !OVERRIDES_PROPERTIES.includes(property),
  );

  const overriddenProperties = ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME[
    metadataName
  ].filter(
    (property) =>
      !fastDeepEqual(
        resolveEffectiveFlatEntityProperty({
          metadataName,
          flatEntity: existingFlatEntity,
          property: property as never,
        }),
        resolveEffectiveFlatEntityProperty({
          metadataName,
          flatEntity: updatedFlatEntity,
          property: property as never,
        }),
      ),
  );

  const readTranslations = (overrides: unknown) =>
    readAuthoredOverrideProperty({
      metadataName,
      overrides,
      path: ['translations'],
      authorContext,
    });
  const translationsChanged =
    'overrides' in flatEntityUpdate &&
    !fastDeepEqual(
      readTranslations(existingFlatEntity.overrides),
      readTranslations(updatedFlatEntity.overrides),
    );

  return [
    ...new Set([
      ...rawProperties,
      ...overriddenProperties,
      ...(translationsChanged ? ['translations'] : []),
    ]),
  ];
};
