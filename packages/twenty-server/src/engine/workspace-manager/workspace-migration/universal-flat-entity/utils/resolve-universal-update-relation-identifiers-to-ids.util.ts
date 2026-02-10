import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataManyToOneRelationConfiguration } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-relations.constant';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type ExtractEntityManyToOneEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-many-to-one-entity-relation-properties.type';
import { type FlatEntityUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-update.type';
import { type MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import {
  ALL_UNIVERSAL_METADATA_RELATIONS,
  type ToUniversalMetadataManyToOneRelationConfiguration,
} from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/constants/all-universal-metadata-relations.constant';
import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';

export const resolveUniversalUpdateRelationIdentifiersToIds = <
  T extends AllMetadataName,
>({
  metadataName,
  universalUpdate,
  allFlatEntityMaps,
}: {
  metadataName: T;
  universalUpdate: UniversalFlatEntityUpdate<T>;
  allFlatEntityMaps: AllFlatEntityMaps;
}): FlatEntityUpdate<T> => {
  const relations = ALL_UNIVERSAL_METADATA_RELATIONS[metadataName].manyToOne;
  const result: Record<string, unknown> = { ...universalUpdate };

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
    } = relation;

    if (!Object.prototype.hasOwnProperty.call(result, universalForeignKey)) {
      continue;
    }

    const universalIdentifierValue = result[universalForeignKey] as
      | string
      | null
      | undefined;

    delete result[universalForeignKey];

    if (!isDefined(universalIdentifierValue)) {
      if (universalIdentifierValue === null) {
        result[foreignKey] = null;
      }

      continue;
    }

    const mapsKey = getMetadataFlatEntityMapsKey(targetMetadataName);

    const targetFlatEntityMaps = allFlatEntityMaps[mapsKey];

    const targetEntity = findFlatEntityByUniversalIdentifier<
      MetadataFlatEntity<typeof targetMetadataName>
    >({
      flatEntityMaps: targetFlatEntityMaps,
      universalIdentifier: universalIdentifierValue,
    });

    if (!isDefined(targetEntity)) {
      throw new FlatEntityMapsException(
        `Could not resolve ${universalForeignKey} to ${foreignKey}: no ${targetMetadataName} found for universal identifier ${universalIdentifierValue}`,
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    result[foreignKey] = targetEntity.id;
  }

  return result as FlatEntityUpdate<T>;
};
