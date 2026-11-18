import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { getViewFieldRelationScopeFieldMetadataUniversalIdentifiers } from 'src/engine/metadata-modules/flat-view-field/utils/get-view-field-relation-scope-field-metadata-universal-identifiers.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldRelationScopeViewFieldsOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'fieldMetadata',
    name: 'fieldRelationScopeViewFieldsOnDelete',
    description:
      'When a field is deleted, delete every view field whose relation scope filters or sorts on it. The scope is jsonb with no foreign key, and dropping only the condition would widen the column, so the column goes.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const viewFieldsToDelete: Record<
      string,
      MetadataUniversalFlatEntity<'viewField'>
    > = {};

    for (const flatViewField of Object.values(
      relatedFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier,
    )) {
      if (
        isDefined(flatViewField) &&
        isDefined(flatViewField.universalRelationScope) &&
        getViewFieldRelationScopeFieldMetadataUniversalIdentifiers(
          flatViewField.universalRelationScope,
        ).includes(flatFieldMetadata.universalIdentifier)
      ) {
        viewFieldsToDelete[flatViewField.universalIdentifier] = flatViewField;
      }
    }

    if (Object.keys(viewFieldsToDelete).length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        viewField: { flatEntityToDelete: viewFieldsToDelete },
      },
    };
  }
}
