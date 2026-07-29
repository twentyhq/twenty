import { msg, t } from '@lingui/core/macro';
import { Injectable } from '@nestjs/common';

import { getSystemViewUniversalIdentifier } from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { MetadataSideEffectExceptionCode } from 'src/engine/metadata-modules/metadata-side-effect/exceptions/metadata-side-effect-exception-code';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

@Injectable()
export class ObjectIndexViewLabelIdentifierOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'objectMetadata',
    name: 'objectIndexViewLabelIdentifierOnUpdate',
    description:
      'When an object label identifier changes onto a pre-existing field, keep that field INDEX view field strictly lowest and visible, as the flat view field validator requires. The engine owns the INDEX view, so this is a system side effect on both the API and manifest-sync paths, and only the engine-owned view field is touched. Relabeling onto a field created in the same operation is handled by fieldIndexViewFieldOnCreate instead (its view field does not exist yet to be updated), so this handler considers only synced view fields. Noop when the label identifier is unchanged, when the object has no engine-owned INDEX view, when the new label identifier has no synced INDEX view field, or when that view field is already visible and strictly lowest.',
  },
) {
  buildSideEffects({
    flatEntity,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const updatedFlatObjectMetadata = flatEntity as UniversalFlatObjectMetadata;

    const existingFlatObjectMetadata =
      relatedFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
        updatedFlatObjectMetadata.universalIdentifier
      ];

    if (!isDefined(existingFlatObjectMetadata)) {
      return {
        status: 'fail',
        type: 'update',
        metadataName: 'objectMetadata',
        flatEntityMinimalInformation: {
          universalIdentifier: updatedFlatObjectMetadata.universalIdentifier,
        } as Partial<MetadataFlatEntity<'objectMetadata'>>,
        errors: [
          {
            code: MetadataSideEffectExceptionCode.SIDE_EFFECT_PARENT_METADATA_NOT_FOUND,
            message: t`Could not resolve the existing object to reconcile its INDEX label identifier view field`,
            userFriendlyMessage: msg`The object to update could not be found to reconcile its INDEX view`,
          },
        ],
      };
    }

    const newLabelIdentifierFieldMetadataUniversalIdentifier =
      updatedFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier;

    if (
      existingFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier ===
        newLabelIdentifierFieldMetadataUniversalIdentifier ||
      !isDefined(newLabelIdentifierFieldMetadataUniversalIdentifier)
    ) {
      return { status: 'noop' };
    }

    const indexViewUniversalIdentifier = getSystemViewUniversalIdentifier({
      applicationUniversalIdentifier:
        updatedFlatObjectMetadata.applicationUniversalIdentifier,
      objectUniversalIdentifier: updatedFlatObjectMetadata.universalIdentifier,
      viewKey: ViewKey.INDEX,
    });

    const indexFlatView =
      relatedFlatEntityMaps.flatViewMaps.byUniversalIdentifier[
        indexViewUniversalIdentifier
      ];

    if (
      !isDefined(indexFlatView) ||
      indexFlatView.isSystemSideEffect !== true ||
      !indexFlatView.isActive ||
      isDefined(indexFlatView.deletedAt)
    ) {
      return { status: 'noop' };
    }

    const indexFlatViewFields = indexFlatView.viewFieldUniversalIdentifiers
      .map(
        (viewFieldUniversalIdentifier) =>
          relatedFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier[
            viewFieldUniversalIdentifier
          ],
      )
      .filter(isDefined)
      .filter(
        (flatViewField) =>
          flatViewField.isActive && !isDefined(flatViewField.deletedAt),
      ) as UniversalFlatViewField[];

    const labelIdentifierFlatViewField = indexFlatViewFields.find(
      (flatViewField) =>
        flatViewField.fieldMetadataUniversalIdentifier ===
        newLabelIdentifierFieldMetadataUniversalIdentifier,
    );

    if (!isDefined(labelIdentifierFlatViewField)) {
      return { status: 'noop' };
    }

    const otherPositions = indexFlatViewFields
      .filter(
        (flatViewField) =>
          flatViewField.universalIdentifier !==
          labelIdentifierFlatViewField.universalIdentifier,
      )
      .map((flatViewField) => flatViewField.position);

    const isAlreadyLowestAndVisible =
      labelIdentifierFlatViewField.isVisible &&
      (otherPositions.length === 0 ||
        labelIdentifierFlatViewField.position < Math.min(...otherPositions));

    if (isAlreadyLowestAndVisible) {
      return { status: 'noop' };
    }

    const targetPosition =
      otherPositions.length === 0 ? 0 : Math.min(...otherPositions) - 1;

    return {
      status: 'success',
      operations: {
        viewField: {
          flatEntityToUpdate: {
            [labelIdentifierFlatViewField.universalIdentifier]: {
              ...labelIdentifierFlatViewField,
              position: targetPosition,
              isVisible: true,
            },
          },
        },
      },
    };
  }
}
