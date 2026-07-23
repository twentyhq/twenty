import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldSystemViewFieldsOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'fieldMetadata',
    name: 'fieldSystemViewFieldsOnDelete',
    description:
      'When a field is deleted, cascade-delete every engine-owned view field displaying it, wherever it lives: the INDEX view fields emitted by fieldIndexViewFieldOnCreate, and the record-page ones. Counterpart of fieldIndexViewFieldOnCreate: the engine authored those view fields, so it owns their deletion. Manifest deletion inference excludes isSystemSideEffect entities, so without this cascade they would only ever disappear through the viewField -> fieldMetadata foreign key, behind the engine back. Caller-authored view fields are NOT touched: they are deleted through normal deletion inference / the field delete transpiler.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const viewFieldToDelete: Record<
      string,
      MetadataUniversalFlatEntity<'viewField'>
    > = {};

    for (const viewFieldUniversalIdentifier of flatFieldMetadata.viewFieldUniversalIdentifiers) {
      const flatViewField =
        relatedFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier[
          viewFieldUniversalIdentifier
        ];

      if (
        !isDefined(flatViewField) ||
        flatViewField.isSystemSideEffect !== true
      ) {
        continue;
      }

      viewFieldToDelete[flatViewField.universalIdentifier] = flatViewField;
    }

    if (Object.keys(viewFieldToDelete).length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        viewField: {
          flatEntityToDelete: viewFieldToDelete,
        },
      },
    };
  }
}
