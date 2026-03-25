import { t } from '@lingui/core/macro';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

type ManyToOneRelationsConfig<T extends AllMetadataName> =
  (typeof ALL_MANY_TO_ONE_METADATA_RELATIONS)[T];

type ExtractUniversalForeignKeys<T> = {
  [K in keyof T]: T[K] extends { universalForeignKey: infer UFK } ? UFK : never;
}[keyof T];

type MetadataUniversalManyToOneJoinColumn<T extends AllMetadataName> =
  ExtractUniversalForeignKeys<ManyToOneRelationsConfig<T>>;

type TargetMetadataNamesForUniversalForeignKeys<
  T extends AllMetadataName,
  TProvidedKeys extends string,
> = {
  [K in keyof ManyToOneRelationsConfig<T>]: ManyToOneRelationsConfig<T>[K] extends {
    universalForeignKey: infer _UFK extends TProvidedKeys;
    metadataName: infer MN extends AllMetadataName;
  }
    ? MN
    : never;
}[keyof ManyToOneRelationsConfig<T>];

type RequiredFlatEntityMapsForUniversalForeignKeys<
  T extends AllMetadataName,
  TProvidedKeys extends string,
> = Pick<
  AllFlatEntityMaps,
  MetadataToFlatEntityMapsKey<
    TargetMetadataNamesForUniversalForeignKeys<T, TProvidedKeys>
  >
>;

type ResolvedForeignKeyIds<
  T extends AllMetadataName,
  TProvidedKeys extends Extract<
    MetadataUniversalManyToOneJoinColumn<T>,
    string
  >,
> = {
  [K in keyof ManyToOneRelationsConfig<T> as ManyToOneRelationsConfig<T>[K] extends {
    universalForeignKey: infer UFK extends string;
    foreignKey: infer FK extends string;
  }
    ? UFK extends TProvidedKeys
      ? FK
      : never
    : never]: ManyToOneRelationsConfig<T>[K] extends { isNullable: true }
    ? string | null
    : string;
};

export const resolveUniversalRelationIdentifiersToIds = <
  T extends AllMetadataName,
  TProvidedKeys extends Extract<
    MetadataUniversalManyToOneJoinColumn<T>,
    string
  > = Extract<MetadataUniversalManyToOneJoinColumn<T>, string>,
>({
  metadataName,
  universalForeignKeyValues,
  flatEntityMaps,
}: {
  metadataName: T;
  universalForeignKeyValues: Record<TProvidedKeys, string | null | undefined>;
  flatEntityMaps: RequiredFlatEntityMapsForUniversalForeignKeys<
    T,
    TProvidedKeys
  >;
}): ResolvedForeignKeyIds<T, TProvidedKeys> => {
  const relationEntries = ALL_MANY_TO_ONE_METADATA_RELATIONS[metadataName];
  const result: Record<string, string | null> = {};

  for (const relationPropertyName of Object.keys(relationEntries)) {
    const relationEntry = relationEntries[
      relationPropertyName as keyof typeof relationEntries
    ] as {
      foreignKey: string;
      metadataName: AllMetadataName;
      isNullable: boolean;
      universalForeignKey: string;
    } | null;

    if (!isDefined(relationEntry)) {
      continue;
    }

    const {
      foreignKey,
      universalForeignKey,
      metadataName: targetMetadataName,
      isNullable,
    } = relationEntry;

    if (
      !Object.prototype.hasOwnProperty.call(
        universalForeignKeyValues,
        universalForeignKey,
      )
    ) {
      continue;
    }

    const universalIdentifierValue =
      universalForeignKeyValues[
        universalForeignKey as keyof typeof universalForeignKeyValues
      ];

    const mapsKey = getMetadataFlatEntityMapsKey(
      targetMetadataName,
    ) as keyof RequiredFlatEntityMapsForUniversalForeignKeys<T, TProvidedKeys>;
    const targetFlatEntityMaps = flatEntityMaps[mapsKey];

    if (isNullable && !isDefined(universalIdentifierValue)) {
      result[foreignKey] = null;

      continue;
    }

    const targetEntity = findFlatEntityByUniversalIdentifier<
      MetadataFlatEntity<typeof targetMetadataName>
    >({
      flatEntityMaps: targetFlatEntityMaps,
      universalIdentifier: universalIdentifierValue as string,
    });

    if (!isDefined(targetEntity)) {
      throw new FlatEntityMapsException(
        t`Could not find ${targetMetadataName} for given ${universalForeignKey}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    result[foreignKey] = targetEntity.id;
  }

  return result as ResolvedForeignKeyIds<T, TProvidedKeys>;
};
