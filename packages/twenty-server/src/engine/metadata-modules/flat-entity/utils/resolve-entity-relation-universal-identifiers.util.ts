import { t } from '@lingui/core/macro';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';

type ManyToOneConfig<T extends AllMetadataName> =
  (typeof ALL_MANY_TO_ONE_METADATA_RELATIONS)[T];

type TargetMetadataNamesForForeignKeys<
  T extends AllMetadataName,
  TProvidedKeys extends string,
> = {
  [K in keyof ManyToOneConfig<T>]: ManyToOneConfig<T>[K] extends {
    foreignKey: infer _FK extends TProvidedKeys;
    metadataName: infer MN extends AllMetadataName;
  }
    ? MN
    : never;
}[keyof ManyToOneConfig<T>];

type RequiredFlatEntityMapsForForeignKeys<
  T extends AllMetadataName,
  TProvidedKeys extends string,
> = Pick<
  AllFlatEntityMaps,
  MetadataToFlatEntityMapsKey<
    TargetMetadataNamesForForeignKeys<T, TProvidedKeys>
  >
>;

type ResolvedUniversalIdentifiers<
  T extends AllMetadataName,
  TProvidedKeys extends Extract<MetadataManyToOneJoinColumn<T>, string>,
> = {
  [K in keyof ManyToOneConfig<T> as ManyToOneConfig<T>[K] extends {
    foreignKey: infer FK extends string;
    universalForeignKey: infer UFK extends string;
  }
    ? FK extends TProvidedKeys
      ? UFK
      : never
    : never]: ManyToOneConfig<T>[K] extends { isNullable: true }
    ? string | null
    : string;
};

export const resolveEntityRelationUniversalIdentifiers = <
  T extends AllMetadataName,
  TProvidedKeys extends Extract<
    MetadataManyToOneJoinColumn<T>,
    string
  > = Extract<MetadataManyToOneJoinColumn<T>, string>,
>({
  metadataName,
  foreignKeyValues,
  flatEntityMaps,
}: {
  metadataName: T;
  foreignKeyValues: Record<TProvidedKeys, string | null | undefined>;
  flatEntityMaps: RequiredFlatEntityMapsForForeignKeys<T, TProvidedKeys>;
}): ResolvedUniversalIdentifiers<T, TProvidedKeys> => {
  const relationEntries = ALL_MANY_TO_ONE_METADATA_RELATIONS[metadataName];
  const result: Record<string, string | null> = {};

  for (const relationPropertyName of Object.keys(relationEntries)) {
    const relation = relationEntries[
      relationPropertyName as keyof typeof relationEntries
    ] as {
      foreignKey: string;
      metadataName: AllMetadataName;
      isNullable: boolean;
      universalForeignKey: string;
    } | null;

    if (!isDefined(relation)) {
      continue;
    }

    const {
      foreignKey,
      metadataName: targetMetadataName,
      isNullable,
      universalForeignKey,
    } = relation;

    if (!Object.prototype.hasOwnProperty.call(foreignKeyValues, foreignKey)) {
      continue;
    }

    const foreignKeyValue =
      foreignKeyValues[foreignKey as keyof typeof foreignKeyValues];

    const mapsKey = getMetadataFlatEntityMapsKey(
      targetMetadataName,
    ) as keyof RequiredFlatEntityMapsForForeignKeys<T, TProvidedKeys>;
    const targetFlatEntityMaps = flatEntityMaps[mapsKey];

    if (isNullable && !isDefined(foreignKeyValue)) {
      result[universalForeignKey] = null;

      continue;
    }

    const resolvedUniversalIdentifier =
      targetFlatEntityMaps.universalIdentifierById[foreignKeyValue as string];

    if (!isDefined(resolvedUniversalIdentifier)) {
      throw new FlatEntityMapsException(
        t`Could not find ${targetMetadataName} for given ${foreignKey}`,
        FlatEntityMapsExceptionCode.RELATION_UNIVERSAL_IDENTIFIER_NOT_FOUND,
      );
    }

    result[universalForeignKey] = resolvedUniversalIdentifier;
  }

  return result as ResolvedUniversalIdentifiers<T, TProvidedKeys>;
};
