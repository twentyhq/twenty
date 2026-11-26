import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldListPinnedViewsOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'fieldMetadata',
    name: 'fieldListPinnedViewsOnDelete',
    description:
      'When a field is deleted, remove it from the pinned fields of every view that still pins it once the migration has run. The pinned fields are a uuid array with no foreign key, so nothing else clears the reference.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const flatViewsToUpdate =
      allFlatEntityOperationRecordByMetadataName.view?.flatEntityToUpdate ?? {};
    const flatViewsToDelete =
      allFlatEntityOperationRecordByMetadataName.view?.flatEntityToDelete ?? {};

    const viewsToUnpinFieldFrom: Record<
      string,
      MetadataUniversalFlatEntity<'view'>
    > = {};

    for (const flatView of Object.values(
      relatedFlatEntityMaps.flatViewMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(flatView) ||
        isDefined(flatViewsToDelete[flatView.universalIdentifier])
      ) {
        continue;
      }

      const viewAfterMigration =
        flatViewsToUpdate[flatView.universalIdentifier] ?? flatView;

      if (
        !isNonEmptyArray(
          viewAfterMigration.listPinnedFieldUniversalIdentifiers,
        ) ||
        !viewAfterMigration.listPinnedFieldUniversalIdentifiers.includes(
          flatFieldMetadata.universalIdentifier,
        )
      ) {
        continue;
      }

      viewsToUnpinFieldFrom[flatView.universalIdentifier] = {
        ...viewAfterMigration,
        listPinnedFieldUniversalIdentifiers:
          viewAfterMigration.listPinnedFieldUniversalIdentifiers.filter(
            (pinnedFieldUniversalIdentifier) =>
              pinnedFieldUniversalIdentifier !==
              flatFieldMetadata.universalIdentifier,
          ),
      };
    }

    if (Object.keys(viewsToUnpinFieldFrom).length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        view: { flatEntityToUpdate: viewsToUnpinFieldFrom },
      },
    };
  }
}
