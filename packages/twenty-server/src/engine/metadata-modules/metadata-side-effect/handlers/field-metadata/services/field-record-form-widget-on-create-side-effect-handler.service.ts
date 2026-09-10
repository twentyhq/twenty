import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { buildFieldSideEffectParentNotFoundFailure } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/build-field-side-effect-parent-not-found-failure.util';
import { resolveParentFlatObjectMetadataAfterStateForFieldSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/resolve-parent-flat-object-metadata-after-state-for-field-side-effect.util';
import { getRecordFormPageLayoutTabUniversalIdentifier } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/get-record-form-page-layout-tab-universal-identifier.util';
import { computeCallerFlatFieldMetadatasForObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-caller-flat-field-metadatas-for-object.util';
import { computeRecordFormFlatFieldMetadatas } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-record-form-flat-field-metadatas.util';
import { isFlatFieldMetadataEligibleForRecordForm } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/is-flat-field-metadata-eligible-for-record-form.util';
import { computeOrderedNewRecordFormFlatFieldMetadatas } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-ordered-new-record-form-flat-field-metadatas.util';
import { computeRecordFormWidgetForExistingObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-record-form-widget-for-existing-object.util';
import { buildSystemFormFieldPageLayoutWidget } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/build-system-form-field-page-layout-widget.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

@Injectable()
export class FieldRecordFormWidgetOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'fieldMetadata',
    name: 'fieldRecordFormWidgetOnCreate',
    description:
      'When a caller-provided field is created, provision its engine-owned FORM_FIELD widget on the engine-owned RECORD_FORM "Fields" tab, resolved strictly by its derived universal identifier. Widgets are the form equivalent of the record page view fields, except there is no view: the widget itself carries the field, so this handler owns every widget on the form, including the ones for fields created in the same batch as their object. On same-batch creation no tab exists in the maps yet, so the index is derived statelessly from the ordered caller field list, exactly as objectRecordFormOnCreate would have ordered it. On an existing object the widget appends after the last FORM_FIELD widget of the tab. Noop when the field is not creatable (system, non UI editable, id, and any type the form has no input for, which today means ACTOR, FILES, NUMERIC, POSITION, RATING, TS_VECTOR and relations other than MANY_TO_ONE), when the object has no engine record form tab, or when the (tab, field) pair is already synced. Unlike the record page, the label identifier gets a widget: a creation form must let the user fill it.',
  },
) {
  buildSideEffects({
    flatEntity: sourceFlatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    if (!isFlatFieldMetadataEligibleForRecordForm(sourceFlatFieldMetadata)) {
      return { status: 'noop' };
    }

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
        operation: 'create',
      });
    }

    const objectApplicationUniversalIdentifier =
      parentFlatObjectMetadata.applicationUniversalIdentifier;

    const recordFormPageLayoutTabUniversalIdentifier =
      getRecordFormPageLayoutTabUniversalIdentifier({
        objectApplicationUniversalIdentifier,
        objectMetadataUniversalIdentifier,
      });

    const { labelIdentifierFieldMetadataUniversalIdentifier } =
      parentFlatObjectMetadata;

    const orderedFormFlatFieldMetadatasInBatch =
      computeRecordFormFlatFieldMetadatas({
        flatFieldMetadatas: computeCallerFlatFieldMetadatasForObject({
          objectMetadataUniversalIdentifier,
          labelIdentifierFieldMetadataUniversalIdentifier,
          allFlatEntityOperationRecordByMetadataName,
        }),
        labelIdentifierFieldMetadataUniversalIdentifier,
      });

    const parentObjectCreatedInSameBatch = isDefined(
      allFlatEntityOperationRecordByMetadataName.objectMetadata
        ?.flatEntityToCreate[objectMetadataUniversalIdentifier],
    );

    const flatPageLayoutWidgetToCreate = parentObjectCreatedInSameBatch
      ? this.buildRecordFormWidgetForObjectCreatedInSameBatch({
          sourceFlatFieldMetadata,
          orderedFormFlatFieldMetadatasInBatch,
          recordFormPageLayoutTabUniversalIdentifier,
        })
      : computeRecordFormWidgetForExistingObject({
          sourceFlatFieldMetadata,
          orderedFormFlatFieldMetadatasInBatch:
            computeOrderedNewRecordFormFlatFieldMetadatas({
              objectMetadataUniversalIdentifier,
              labelIdentifierFieldMetadataUniversalIdentifier,
              recordFormPageLayoutTabUniversalIdentifier,
              allFlatEntityOperationRecordByMetadataName,
              flatPageLayoutWidgetMaps:
                relatedFlatEntityMaps.flatPageLayoutWidgetMaps,
            }),
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

  private buildRecordFormWidgetForObjectCreatedInSameBatch({
    sourceFlatFieldMetadata,
    orderedFormFlatFieldMetadatasInBatch,
    recordFormPageLayoutTabUniversalIdentifier,
  }: {
    sourceFlatFieldMetadata: UniversalFlatFieldMetadata;
    orderedFormFlatFieldMetadatasInBatch: UniversalFlatFieldMetadata[];
    recordFormPageLayoutTabUniversalIdentifier: string;
  }): UniversalFlatPageLayoutWidget | undefined {
    const index = orderedFormFlatFieldMetadatasInBatch.findIndex(
      (orderedFlatFieldMetadata) =>
        orderedFlatFieldMetadata.universalIdentifier ===
        sourceFlatFieldMetadata.universalIdentifier,
    );

    if (index === -1) {
      return undefined;
    }

    return buildSystemFormFieldPageLayoutWidget({
      applicationUniversalIdentifier:
        sourceFlatFieldMetadata.applicationUniversalIdentifier,
      pageLayoutTabUniversalIdentifier:
        recordFormPageLayoutTabUniversalIdentifier,
      objectMetadataUniversalIdentifier:
        sourceFlatFieldMetadata.objectMetadataUniversalIdentifier,
      flatFieldMetadata: sourceFlatFieldMetadata,
      index,
    });
  }
}
