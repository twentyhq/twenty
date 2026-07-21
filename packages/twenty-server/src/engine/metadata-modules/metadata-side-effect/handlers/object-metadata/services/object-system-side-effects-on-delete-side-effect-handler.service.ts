import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectOperationsByMetadataName } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operations-by-metadata-name.type';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class ObjectSystemSideEffectsOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'objectMetadata',
    name: 'objectSystemSideEffectsOnDelete',
    description:
      'When an object is deleted, cascade-delete its engine-owned side effects: the reserved system fields, the default relation fields (forward field on the deleted object and reverse morph field on the standard object), every system index (reverse join-column indexes, the GIN searchVector index), and its searchFieldMetadata rows. The engine is the sole authority for isSystemSideEffect entities on delete: the API object delete transpiler cascades only user-authored fields and indexes, and manifest deletion inference excludes these entities entirely. Caller-provided defaults (e.g. the name field) are NOT engine-owned and are deleted through normal deletion inference / the object delete transpiler.',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const objectMetadataUniversalIdentifier =
      flatObjectMetadata.universalIdentifier;

    const fieldMetadataToDelete: Record<
      string,
      MetadataUniversalFlatEntity<'fieldMetadata'>
    > = {};
    const deletedFieldUniversalIdentifiers = new Set<string>();

    for (const flatFieldMetadata of Object.values(
      relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatFieldMetadata)) {
        continue;
      }

      if (flatFieldMetadata.isSystemSideEffect !== true) {
        continue;
      }

      const belongsToObject =
        flatFieldMetadata.objectMetadataUniversalIdentifier ===
        objectMetadataUniversalIdentifier;
      const targetsObject =
        flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier ===
        objectMetadataUniversalIdentifier;

      if (!belongsToObject && !targetsObject) {
        continue;
      }

      fieldMetadataToDelete[flatFieldMetadata.universalIdentifier] =
        flatFieldMetadata;
      deletedFieldUniversalIdentifiers.add(
        flatFieldMetadata.universalIdentifier,
      );
    }

    const indexToDelete: Record<
      string,
      MetadataUniversalFlatEntity<'index'>
    > = {};

    for (const flatIndexMetadata of Object.values(
      relatedFlatEntityMaps.flatIndexMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatIndexMetadata)) {
        continue;
      }

      if (flatIndexMetadata.isSystemSideEffect !== true) {
        continue;
      }

      const belongsToObject =
        flatIndexMetadata.objectMetadataUniversalIdentifier ===
        objectMetadataUniversalIdentifier;
      const referencesDeletedField =
        flatIndexMetadata.universalFlatIndexFieldMetadatas.some(
          (universalFlatIndexFieldMetadata) =>
            deletedFieldUniversalIdentifiers.has(
              universalFlatIndexFieldMetadata.fieldMetadataUniversalIdentifier,
            ),
        );

      if (!belongsToObject && !referencesDeletedField) {
        continue;
      }

      indexToDelete[flatIndexMetadata.universalIdentifier] = flatIndexMetadata;
    }

    const searchFieldMetadataToDelete: Record<
      string,
      MetadataUniversalFlatEntity<'searchFieldMetadata'>
    > = {};

    for (const flatSearchFieldMetadata of Object.values(
      relatedFlatEntityMaps.flatSearchFieldMetadataMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatSearchFieldMetadata)) {
        continue;
      }

      if (
        flatSearchFieldMetadata.objectMetadataUniversalIdentifier !==
        objectMetadataUniversalIdentifier
      ) {
        continue;
      }

      searchFieldMetadataToDelete[flatSearchFieldMetadata.universalIdentifier] =
        flatSearchFieldMetadata;
    }

    const hasFieldMetadataToDelete =
      Object.keys(fieldMetadataToDelete).length > 0;
    const hasIndexToDelete = Object.keys(indexToDelete).length > 0;
    const hasSearchFieldMetadataToDelete =
      Object.keys(searchFieldMetadataToDelete).length > 0;

    if (
      !hasFieldMetadataToDelete &&
      !hasIndexToDelete &&
      !hasSearchFieldMetadataToDelete
    ) {
      return { status: 'noop' };
    }

    const operations: MetadataSideEffectOperationsByMetadataName = {
      ...(hasFieldMetadataToDelete && {
        fieldMetadata: { flatEntityToDelete: fieldMetadataToDelete },
      }),
      ...(hasIndexToDelete && {
        index: { flatEntityToDelete: indexToDelete },
      }),
      ...(hasSearchFieldMetadataToDelete && {
        searchFieldMetadata: {
          flatEntityToDelete: searchFieldMetadataToDelete,
        },
      }),
    };

    return {
      status: 'success',
      operations,
    };
  }
}
