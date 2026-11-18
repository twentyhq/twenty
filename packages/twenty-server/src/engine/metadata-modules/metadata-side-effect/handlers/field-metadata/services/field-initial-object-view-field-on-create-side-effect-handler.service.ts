import { Injectable } from '@nestjs/common';

import { isDefined, isMorphRelationHead } from 'twenty-shared/utils';

import { computeInitialObjectViewFieldForExistingObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-initial-object-view-field-for-existing-object.util';
import { redirectMorphRelationTargetViewFieldToHead } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/redirect-morph-relation-target-view-field-to-head.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldInitialObjectViewFieldOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'fieldMetadata',
    name: 'fieldInitialObjectViewFieldOnCreate',
    description:
      'When a caller-provided field is created on an existing object by another application than the one owning the object initial view (the user-owned "All {objectLabelPlural}" table view users land on, which hides the INDEX view), provision a visible engine-owned view field on that initial view, appended after its existing active positions. Without it a field contributed by an installed application only lands on the hidden INDEX view (fieldIndexViewFieldOnCreate) and stays invisible until someone adds the column by hand. The view field is attributed to the application owning the field, like its INDEX counterpart, so it is removed with the field (fieldSystemViewFieldsOnDelete) and on uninstall. The initial view itself stays user-owned and is never reconciled: only this one view field is emitted, once, on field creation. Noop when the object is created in the same operation (its creator seeds the initial view), when the object has no live initial view, when the field belongs to the application owning the initial view (its owner places its own fields), or when the field is the object label identifier.',
  },
) {
  buildSideEffects({
    flatEntity: sourceFlatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    if (isMorphRelationHead(sourceFlatFieldMetadata)) {
      return { status: 'noop' };
    }

    const existingFlatObjectMetadata =
      relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        sourceFlatFieldMetadata.objectMetadataUniversalIdentifier
      ];

    if (!isDefined(existingFlatObjectMetadata)) {
      return { status: 'noop' };
    }

    const flatInitialObjectViewFieldToCreate =
      computeInitialObjectViewFieldForExistingObject({
        sourceFlatFieldMetadata,
        flatObjectMetadata: existingFlatObjectMetadata,
        allFlatEntityOperationRecordByMetadataName,
        flatViewMaps: relatedFlatEntityMaps.flatViewMaps,
        flatViewFieldMaps: relatedFlatEntityMaps.flatViewFieldMaps,
      });

    if (!isDefined(flatInitialObjectViewFieldToCreate)) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        viewField: {
          flatEntityToCreate: redirectMorphRelationTargetViewFieldToHead({
            sourceFlatFieldMetadata,
            flatViewFieldToCreate: flatInitialObjectViewFieldToCreate,
            relatedFlatEntityMaps,
          }),
        },
      },
    };
  }
}
