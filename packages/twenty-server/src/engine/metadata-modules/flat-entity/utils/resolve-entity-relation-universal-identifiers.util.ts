import { t } from '@lingui/core/macro';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  ALL_METADATA_RELATIONS,
  type MetadataManyToOneRelationConfiguration,
} from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations.constant';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';
import { type MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { type RemoveSuffix } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/remove-suffix.type';

type ManyToOneConfig<T extends AllMetadataName> =
  (typeof ALL_METADATA_RELATIONS)[T]['manyToOne'];

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
  }
    ? FK extends TProvidedKeys
      ? `${RemoveSuffix<FK, 'Id'>}UniversalIdentifier`
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
  const relations = ALL_METADATA_RELATIONS[metadataName].manyToOne;
  const result: Record<string, string | null> = {};

  for (const relation of Object.values(
    relations,
  ) as MetadataManyToOneRelationConfiguration<
    T,
    ExtractEntityManyToOneEntityRelationProperties<MetadataEntity<T>>
  >[]) {
    if (!isDefined(relation)) {
      continue;
    }

    const {
      foreignKey,
      metadataName: targetMetadataName,
      isNullable,
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

    // TODO refactor using the new ALL_METADATA_UNIVERSAL_RELATION afterwards
    const universalIdentifierKey = foreignKey.replace(
      /Id$/,
      'UniversalIdentifier',
    );

    if (isNullable && !isDefined(foreignKeyValue)) {
      result[universalIdentifierKey] = null;

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

    result[universalIdentifierKey] = resolvedUniversalIdentifier;
  }

  return result as ResolvedUniversalIdentifiers<T, TProvidedKeys>;
};
