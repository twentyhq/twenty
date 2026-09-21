import { Injectable } from '@nestjs/common';

import { getSystemFormFieldPageLayoutWidgetUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { buildFieldSideEffectParentNotFoundFailure } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/build-field-side-effect-parent-not-found-failure.util';
import { resolveParentFlatObjectMetadataAfterStateForFieldSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/resolve-parent-flat-object-metadata-after-state-for-field-side-effect.util';
import { computeOrderedNewRecordFormFlatFieldMetadatas } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-ordered-new-record-form-flat-field-metadatas.util';
import { computeRecordFormWidgetForExistingObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-record-form-widget-for-existing-object.util';
import { getRecordFormPageLayoutTabUniversalIdentifier } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/get-record-form-page-layout-tab-universal-identifier.util';
import { isFlatFieldMetadataEligibleForRecordForm } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/is-flat-field-metadata-eligible-for-record-form.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldRecordFormWidgetOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'fieldMetadata',
    name: 'fieldRecordFormWidgetOnUpdate',
    description:
      'When a field is updated, realign its engine-owned FORM_FIELD widget with the form eligibility predicate, which unlike the record page one reads mutable properties: isActive, isUIEditable and the relation type in settings. Deactivating a field, revoking its UI editability or retargeting a relation away from MANY_TO_ONE deletes its widget; the reverse re-provisions one, appended after the last widget of the tab. Without this the form drifts permanently: a deactivated field would keep a widget pointing at it, and a field that only became creatable later would never get one, since fieldRecordFormWidgetOnCreate fires once. The record page needs no such handler because its predicate reads only immutable properties plus the label identifier, which objectRecordPageLabelIdentifierOnUpdate owns. Noop when eligibility did not change relative to the widget that exists, when the object has no engine record form tab, or when the widget found is not engine-owned.',
  },
) {
  buildSideEffects({
    flatEntity: sourceFlatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const { objectMetadataUniversalIdentifier } = sourceFlatFieldMetadata;

    const parentFlatObjectMetadata =
      resolveParentFlatObjectMetadataAfterStateForFieldSideEffect({
        objectMetadataUniversalIdentifier,
        allFlatEntityOperationRecordByMetadataName,
        relatedFlatEntityMaps,
      });

    if (!isDefined(parentFlatObjectMetadata)) {
      return buildFieldSideEffectParentNotFoundFailure({
        flatFieldMetadata: sourceFlatFieldMetadata,
        operation: 'update',
      });
    }

    const recordFormPageLayoutTabUniversalIdentifier =
      getRecordFormPageLayoutTabUniversalIdentifier({
        objectApplicationUniversalIdentifier:
          parentFlatObjectMetadata.applicationUniversalIdentifier,
        objectMetadataUniversalIdentifier,
      });

    const existingFlatPageLayoutWidget =
      relatedFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
        getSystemFormFieldPageLayoutWidgetUniversalIdentifier({
          fieldMetadataApplicationUniversalIdentifier:
            sourceFlatFieldMetadata.applicationUniversalIdentifier,
          pageLayoutTabUniversalIdentifier:
            recordFormPageLayoutTabUniversalIdentifier,
          fieldMetadataUniversalIdentifier:
            sourceFlatFieldMetadata.universalIdentifier,
        })
      ];

    const isEligible = isFlatFieldMetadataEligibleForRecordForm(
      sourceFlatFieldMetadata,
    );

    const orderedNewlyEligibleFlatFieldMetadatas =
      computeOrderedNewRecordFormFlatFieldMetadatas({
        objectMetadataUniversalIdentifier,
        labelIdentifierFieldMetadataUniversalIdentifier:
          parentFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
        recordFormPageLayoutTabUniversalIdentifier,
        allFlatEntityOperationRecordByMetadataName,
        flatPageLayoutWidgetMaps:
          relatedFlatEntityMaps.flatPageLayoutWidgetMaps,
      });

    if (
      isEligible &&
      !isDefined(existingFlatPageLayoutWidget) &&
      !isDefined(
        allFlatEntityOperationRecordByMetadataName.fieldMetadata
          ?.flatEntityToCreate[sourceFlatFieldMetadata.universalIdentifier],
      )
    ) {
      const flatPageLayoutWidgetToCreate =
        computeRecordFormWidgetForExistingObject({
          sourceFlatFieldMetadata,
          orderedFormFlatFieldMetadatasInBatch:
            orderedNewlyEligibleFlatFieldMetadatas,
          recordFormPageLayoutTabUniversalIdentifier,
          flatPageLayoutTabMaps: relatedFlatEntityMaps.flatPageLayoutTabMaps,
          flatPageLayoutWidgetMaps:
            relatedFlatEntityMaps.flatPageLayoutWidgetMaps,
        });

      if (!isDefined(flatPageLayoutWidgetToCreate)) {
        return { status: 'noop' };
      }

      return {
        status: 'success',
        operations: {
          pageLayoutWidget: {
            flatEntityToCreate: {
              [flatPageLayoutWidgetToCreate.universalIdentifier]:
                flatPageLayoutWidgetToCreate,
            },
          },
        },
      };
    }

    if (
      !isEligible &&
      isDefined(existingFlatPageLayoutWidget) &&
      existingFlatPageLayoutWidget.isSystemSideEffect === true
    ) {
      return {
        status: 'success',
        operations: {
          pageLayoutWidget: {
            flatEntityToDelete: {
              [existingFlatPageLayoutWidget.universalIdentifier]:
                existingFlatPageLayoutWidget,
            },
          },
        },
      };
    }

    return { status: 'noop' };
  }
}
