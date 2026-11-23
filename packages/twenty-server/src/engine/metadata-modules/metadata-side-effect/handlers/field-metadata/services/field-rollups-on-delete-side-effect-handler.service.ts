import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findRollupFlatFieldMetadatasDependingOnFields } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-rollup-flat-field-metadatas-depending-on-fields.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldRollupsOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'fieldMetadata',
    name: 'fieldRollupsOnDelete',
    description:
      'When a field is deleted, delete every rollup field that goes through it, calculates on it or filters on it, the rollups calculated from those, and the view fields displaying them. The rollup settings are jsonb with no foreign key, and a rollup that lost its relation, its field or a filter would silently compute something else.',
  },
) {
  buildSideEffects({
    flatEntity: deletedFlatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps: { flatFieldMetadataMaps, flatViewFieldMaps },
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const fieldsAlreadyDeleted =
      allFlatEntityOperationRecordByMetadataName.fieldMetadata
        ?.flatEntityToDelete ?? {};

    const rollupsToDelete = findRollupFlatFieldMetadatasDependingOnFields({
      fieldMetadataUniversalIdentifiers: [
        deletedFlatFieldMetadata.universalIdentifier,
      ],
      rollupFlatFieldMetadatas: Object.values(
        flatFieldMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .filter((flatFieldMetadata) =>
          isFlatFieldMetadataOfType(
            flatFieldMetadata,
            FieldMetadataType.ROLLUP,
          ),
        ),
    }).filter(
      ({ universalIdentifier }) =>
        !isDefined(fieldsAlreadyDeleted[universalIdentifier]),
    );

    if (rollupsToDelete.length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        fieldMetadata: {
          flatEntityToDelete: Object.fromEntries(
            rollupsToDelete.map((rollup) => [
              rollup.universalIdentifier,
              rollup,
            ]),
          ),
        },
        viewField: {
          flatEntityToDelete: Object.fromEntries(
            rollupsToDelete
              .flatMap((rollup) => rollup.viewFieldUniversalIdentifiers)
              .map(
                (universalIdentifier) =>
                  flatViewFieldMaps.byUniversalIdentifier[universalIdentifier],
              )
              .filter(isDefined)
              .map((viewField) => [viewField.universalIdentifier, viewField]),
          ),
        },
      },
    };
  }
}
