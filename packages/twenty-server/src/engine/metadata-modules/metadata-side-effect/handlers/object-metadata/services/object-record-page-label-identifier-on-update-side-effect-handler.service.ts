import { msg, t } from '@lingui/core/macro';
import { Injectable } from '@nestjs/common';

import {
  SYSTEM_VIEW_KEYS,
  getSystemViewUniversalIdentifier,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps.util';
import { MetadataSideEffectExceptionCode } from 'src/engine/metadata-modules/metadata-side-effect/exceptions/metadata-side-effect-exception-code';
import { computeRecordPageViewFieldForExistingObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-record-page-view-field-for-existing-object.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectOperationsByMetadataName } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operations-by-metadata-name.type';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

@Injectable()
export class ObjectRecordPageLabelIdentifierOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'objectMetadata',
    name: 'objectRecordPageLabelIdentifierOnUpdate',
    description:
      'When an object label identifier changes onto a pre-existing field, preserve the record-page exclusion invariant, the inverse of objectIndexViewLabelIdentifierOnUpdate: the engine-owned FIELDS_WIDGET record-page view never displays the label identifier (the record page shows it in the title), so the new label identifier engine-owned view field is deleted from the record-page view, and the previous label identifier gets its view field restored through the widget-driven builder (visibility from the FIELDS widget newFieldDefaultVisibility, appended into the last active group). Only engine-owned (isSystemSideEffect) view fields are touched. Relabeling onto a field created in the same operation is handled by fieldRecordPageViewFieldOnCreate instead. The restore is emitted even when the caller batch declares a view field for the same (view, field) pair: the engine always produces its system side effects, and the pair-uniqueness validator surfaces the conflict to the caller. Noop when the label identifier is unchanged, when the object has no engine-owned record-page view, when the new label identifier has no engine-owned record-page view field and the old one is already displayed or not restorable.',
  },
) {
  buildSideEffects({
    flatEntity,
    allFlatEntityOperationRecordByMetadataName,
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
            message: t`Could not resolve the existing object to reconcile its record-page label identifier view field`,
            userFriendlyMessage: msg`The object to update could not be found to reconcile its record page`,
          },
        ],
      };
    }

    const previousLabelIdentifierFieldMetadataUniversalIdentifier =
      existingFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier;
    const newLabelIdentifierFieldMetadataUniversalIdentifier =
      updatedFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier;

    if (
      previousLabelIdentifierFieldMetadataUniversalIdentifier ===
        newLabelIdentifierFieldMetadataUniversalIdentifier ||
      !isDefined(newLabelIdentifierFieldMetadataUniversalIdentifier)
    ) {
      return { status: 'noop' };
    }

    const recordPageViewUniversalIdentifier = getSystemViewUniversalIdentifier({
      objectMetadataApplicationUniversalIdentifier:
        updatedFlatObjectMetadata.applicationUniversalIdentifier,
      objectUniversalIdentifier: updatedFlatObjectMetadata.universalIdentifier,
      viewKey: SYSTEM_VIEW_KEYS.FIELDS_WIDGET,
    });

    const recordPageFlatView =
      relatedFlatEntityMaps.flatViewMaps.byUniversalIdentifier[
        recordPageViewUniversalIdentifier
      ];

    if (
      !isDefined(recordPageFlatView) ||
      recordPageFlatView.isSystemSideEffect !== true ||
      isDefined(recordPageFlatView.deletedAt)
    ) {
      return { status: 'noop' };
    }

    const recordPageFlatViewFields =
      findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
        flatEntityMaps: relatedFlatEntityMaps.flatViewFieldMaps,
        universalIdentifiers: recordPageFlatView.viewFieldUniversalIdentifiers,
      }).filter((flatViewField) => !isDefined(flatViewField.deletedAt));

    const newLabelIdentifierFlatViewFieldToDelete =
      recordPageFlatViewFields.find(
        (flatViewField) =>
          flatViewField.fieldMetadataUniversalIdentifier ===
            newLabelIdentifierFieldMetadataUniversalIdentifier &&
          flatViewField.isSystemSideEffect === true,
      );

    const previousLabelIdentifierFlatViewFieldToCreate =
      this.buildRestoredPreviousLabelIdentifierViewField({
        previousLabelIdentifierFieldMetadataUniversalIdentifier,
        recordPageViewUniversalIdentifier,
        recordPageFlatViewFields,
        allFlatEntityOperationRecordByMetadataName,
        relatedFlatEntityMaps,
      });

    const operations: MetadataSideEffectOperationsByMetadataName = {};

    if (
      isDefined(newLabelIdentifierFlatViewFieldToDelete) ||
      isDefined(previousLabelIdentifierFlatViewFieldToCreate)
    ) {
      operations.viewField = {
        ...(isDefined(newLabelIdentifierFlatViewFieldToDelete)
          ? {
              flatEntityToDelete: {
                [newLabelIdentifierFlatViewFieldToDelete.universalIdentifier]:
                  newLabelIdentifierFlatViewFieldToDelete,
              },
            }
          : {}),
        ...(isDefined(previousLabelIdentifierFlatViewFieldToCreate)
          ? {
              flatEntityToCreate: {
                [previousLabelIdentifierFlatViewFieldToCreate.universalIdentifier]:
                  previousLabelIdentifierFlatViewFieldToCreate,
              },
            }
          : {}),
      };
    }

    if (Object.keys(operations).length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations,
    };
  }

  private buildRestoredPreviousLabelIdentifierViewField({
    previousLabelIdentifierFieldMetadataUniversalIdentifier,
    recordPageViewUniversalIdentifier,
    recordPageFlatViewFields,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: {
    previousLabelIdentifierFieldMetadataUniversalIdentifier: string | null;
    recordPageViewUniversalIdentifier: string;
    recordPageFlatViewFields: UniversalFlatViewField[];
    allFlatEntityOperationRecordByMetadataName: BuildSideEffectsArgs<'objectMetadata'>['allFlatEntityOperationRecordByMetadataName'];
    relatedFlatEntityMaps: BuildSideEffectsArgs<'objectMetadata'>['relatedFlatEntityMaps'];
  }): UniversalFlatViewField | undefined {
    if (!isDefined(previousLabelIdentifierFieldMetadataUniversalIdentifier)) {
      return undefined;
    }

    const previousLabelIdentifierDeletedInSameBatch = isDefined(
      allFlatEntityOperationRecordByMetadataName.fieldMetadata
        ?.flatEntityToDelete[
        previousLabelIdentifierFieldMetadataUniversalIdentifier
      ],
    );

    if (previousLabelIdentifierDeletedInSameBatch) {
      return undefined;
    }

    const previousLabelIdentifierFlatFieldMetadata =
      relatedFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        previousLabelIdentifierFieldMetadataUniversalIdentifier
      ];

    if (!isDefined(previousLabelIdentifierFlatFieldMetadata)) {
      return undefined;
    }

    const previousLabelIdentifierAlreadyDisplayed =
      recordPageFlatViewFields.some(
        (flatViewField) =>
          flatViewField.fieldMetadataUniversalIdentifier ===
          previousLabelIdentifierFieldMetadataUniversalIdentifier,
      );

    if (previousLabelIdentifierAlreadyDisplayed) {
      return undefined;
    }

    return computeRecordPageViewFieldForExistingObject({
      sourceFlatFieldMetadata: previousLabelIdentifierFlatFieldMetadata,
      recordPageViewUniversalIdentifier,
      flatViewMaps: relatedFlatEntityMaps.flatViewMaps,
      flatViewFieldMaps: relatedFlatEntityMaps.flatViewFieldMaps,
      flatViewFieldGroupMaps: relatedFlatEntityMaps.flatViewFieldGroupMaps,
      flatPageLayoutWidgetMaps: relatedFlatEntityMaps.flatPageLayoutWidgetMaps,
    });
  }
}
