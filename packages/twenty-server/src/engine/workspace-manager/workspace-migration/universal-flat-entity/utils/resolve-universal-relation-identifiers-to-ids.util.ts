import { t } from '@lingui/core/macro';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataManyToOneRelationConfiguration } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations.constant';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import {
  ALL_UNIVERSAL_METADATA_RELATIONS,
  type ToUniversalMetadataManyToOneRelationConfiguration,
} from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-universal-metadata-relations.constant';

type UniversalManyToOneConfig<T extends AllMetadataName> =
  (typeof ALL_UNIVERSAL_METADATA_RELATIONS)[T]['manyToOne'];

type ExtractUniversalForeignKeys<T> = {
  [K in keyof T]: T[K] extends { universalForeignKey: infer UFK } ? UFK : never;
}[keyof T];

type MetadataUniversalManyToOneJoinColumn<T extends AllMetadataName> =
  ExtractUniversalForeignKeys<UniversalManyToOneConfig<T>>;

type TargetMetadataNamesForUniversalForeignKeys<
  T extends AllMetadataName,
  TProvidedKeys extends string,
> = {
  [K in keyof UniversalManyToOneConfig<T>]: UniversalManyToOneConfig<T>[K] extends {
    universalForeignKey: infer _UFK extends TProvidedKeys;
    metadataName: infer MN extends AllMetadataName;
  }
    ? MN
    : never;
}[keyof UniversalManyToOneConfig<T>];

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
  [K in keyof UniversalManyToOneConfig<T> as UniversalManyToOneConfig<T>[K] extends {
    universalForeignKey: infer UFK extends string;
    foreignKey: infer FK extends string;
  }
    ? UFK extends TProvidedKeys
      ? FK
      : never
    : never]: UniversalManyToOneConfig<T>[K] extends { isNullable: true }
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
  const relations = ALL_UNIVERSAL_METADATA_RELATIONS[metadataName].manyToOne;
  const result: Record<string, string | null> = {};

  for (const relation of Object.values(
    relations,
  ) as ToUniversalMetadataManyToOneRelationConfiguration<
    MetadataManyToOneRelationConfiguration<
      T,
      ExtractEntityManyToOneEntityRelationProperties<MetadataEntity<T>>
    >
  >[]) {
    if (!isDefined(relation)) {
      continue;
    }

    const {
      foreignKey,
      universalForeignKey,
      metadataName: targetMetadataName,
      isNullable,
    } = relation;

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
