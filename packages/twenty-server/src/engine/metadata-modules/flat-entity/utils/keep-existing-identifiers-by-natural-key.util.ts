import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { NATURAL_KEY_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/natural-key-properties-by-metadata-name.constant';

type FlatEntityWithUniversalIdentifier = {
  universalIdentifier: string;
} & Record<string, unknown>;

type FlatEntityMapsByUniversalIdentifier = {
  byUniversalIdentifier: Partial<
    Record<string, FlatEntityWithUniversalIdentifier>
  >;
};

const computeNaturalKey = (
  flatEntity: FlatEntityWithUniversalIdentifier,
  naturalKeyProperties: string[],
): string =>
  JSON.stringify(naturalKeyProperties.map((property) => flatEntity[property]));

export const keepExistingIdentifiersByNaturalKey = <
  TFlatEntityMaps extends FlatEntityMapsByUniversalIdentifier,
>({
  metadataName,
  fromFlatEntityMaps,
  toFlatEntityMaps,
}: {
  metadataName: AllMetadataName;
  fromFlatEntityMaps: TFlatEntityMaps;
  toFlatEntityMaps: TFlatEntityMaps;
}): TFlatEntityMaps => {
  const naturalKeyProperties: string[] | undefined =
    NATURAL_KEY_PROPERTIES_BY_METADATA_NAME[metadataName];

  if (!isDefined(naturalKeyProperties)) {
    return toFlatEntityMaps;
  }

  const existingUniversalIdentifierByNaturalKey = new Map(
    Object.values(fromFlatEntityMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map((fromFlatEntity) => [
        computeNaturalKey(fromFlatEntity, naturalKeyProperties),
        fromFlatEntity.universalIdentifier,
      ]),
  );

  const toFlatEntities = Object.values(
    toFlatEntityMaps.byUniversalIdentifier,
  ).filter(isDefined);

  const existingUniversalIdentifierByToUniversalIdentifier = new Map<
    string,
    string
  >();

  for (const toFlatEntity of toFlatEntities) {
    const existingUniversalIdentifier =
      existingUniversalIdentifierByNaturalKey.get(
        computeNaturalKey(toFlatEntity, naturalKeyProperties),
      );

    if (
      isDefined(existingUniversalIdentifier) &&
      existingUniversalIdentifier !== toFlatEntity.universalIdentifier
    ) {
      existingUniversalIdentifierByToUniversalIdentifier.set(
        toFlatEntity.universalIdentifier,
        existingUniversalIdentifier,
      );
    }
  }

  if (existingUniversalIdentifierByToUniversalIdentifier.size === 0) {
    return toFlatEntityMaps;
  }

  const stayingUniversalIdentifiers = new Set(
    toFlatEntities
      .map((toFlatEntity) => toFlatEntity.universalIdentifier)
      .filter(
        (universalIdentifier) =>
          !existingUniversalIdentifierByToUniversalIdentifier.has(
            universalIdentifier,
          ),
      ),
  );
  const claimCountByExistingUniversalIdentifier = new Map<string, number>();

  for (const existingUniversalIdentifier of existingUniversalIdentifierByToUniversalIdentifier.values()) {
    claimCountByExistingUniversalIdentifier.set(
      existingUniversalIdentifier,
      (claimCountByExistingUniversalIdentifier.get(
        existingUniversalIdentifier,
      ) ?? 0) + 1,
    );
  }

  const byUniversalIdentifier = Object.fromEntries(
    toFlatEntities.map((toFlatEntity) => {
      const existingUniversalIdentifier =
        existingUniversalIdentifierByToUniversalIdentifier.get(
          toFlatEntity.universalIdentifier,
        );

      if (
        !isDefined(existingUniversalIdentifier) ||
        stayingUniversalIdentifiers.has(existingUniversalIdentifier) ||
        claimCountByExistingUniversalIdentifier.get(
          existingUniversalIdentifier,
        ) !== 1
      ) {
        return [toFlatEntity.universalIdentifier, toFlatEntity];
      }

      return [
        existingUniversalIdentifier,
        { ...toFlatEntity, universalIdentifier: existingUniversalIdentifier },
      ];
    }),
  );

  return { ...toFlatEntityMaps, byUniversalIdentifier };
};
