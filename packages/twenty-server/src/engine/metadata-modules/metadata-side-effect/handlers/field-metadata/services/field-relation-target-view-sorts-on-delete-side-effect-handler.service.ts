import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldRelationTargetViewSortsOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'fieldMetadata',
    name: 'fieldRelationTargetViewSortsOnDelete',
    description:
      'When a field is deleted, delete every view sort that still orders by it through a relation once the migration has run. A sort repointed to another field in the same migration is kept: the relationTargetFieldMetadataId foreign key only nulls the reference, so the repoint lands after the field deletion.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const flatViewSortsToUpdate =
      allFlatEntityOperationRecordByMetadataName.viewSort?.flatEntityToUpdate ??
      {};

    const viewSortsToDelete: Record<
      string,
      MetadataUniversalFlatEntity<'viewSort'>
    > = {};

    for (const flatViewSort of Object.values(
      relatedFlatEntityMaps.flatViewSortMaps.byUniversalIdentifier,
    )) {
      if (!isDefined(flatViewSort)) {
        continue;
      }

      const viewSortAfterMigration =
        flatViewSortsToUpdate[flatViewSort.universalIdentifier] ?? flatViewSort;

      if (
        viewSortAfterMigration.relationTargetFieldMetadataUniversalIdentifier ===
        flatFieldMetadata.universalIdentifier
      ) {
        viewSortsToDelete[flatViewSort.universalIdentifier] = flatViewSort;
      }
    }

    if (Object.keys(viewSortsToDelete).length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        viewSort: { flatEntityToDelete: viewSortsToDelete },
      },
    };
  }
}
