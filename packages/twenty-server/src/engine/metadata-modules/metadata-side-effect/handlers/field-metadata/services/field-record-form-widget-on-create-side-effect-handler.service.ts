import { Injectable } from '@nestjs/common';

import {
  getSystemPageLayoutTabUniversalIdentifier,
  getSystemRecordFormPageLayoutUniversalIdentifier,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { buildFieldSideEffectParentNotFoundFailure } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/build-field-side-effect-parent-not-found-failure.util';
import { resolveParentFlatObjectMetadataAfterStateForFieldSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/resolve-parent-flat-object-metadata-after-state-for-field-side-effect.util';
import { RECORD_FORM_TAB_PROPS } from 'src/engine/metadata-modules/metadata-side-effect/constants/record-form-tab-props.constant';
import { computeCallerFlatFieldMetadatasForObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-caller-flat-field-metadatas-for-object.util';
import {
  computeRecordFormFlatFieldMetadatas,
  isFlatFieldMetadataEligibleForRecordForm,
} from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-record-form-flat-field-metadatas.util';
import { computeRecordFormWidgetForExistingObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-record-form-widget-for-existing-object.util';
import { buildSystemFormFieldPageLayoutWidget } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-system-record-form-page-layout-to-create.util';
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
      'When a caller-provided field is created, provision its engine-owned FORM_FIELD widget on the engine-owned RECORD_FORM "Fields" tab, resolved strictly by its derived universal identifier. Widgets are the form equivalent of the record page view fields, except there is no view: the widget itself carries the field, so this handler owns every widget on the form, including the ones for fields created in the same batch as their object. On same-batch creation no tab exists in the maps yet, so the index is derived statelessly from the ordered caller field list, exactly as objectRecordFormOnCreate would have ordered it. On an existing object the widget appends after the last FORM_FIELD widget of the tab. Noop when the field is not creatable (system, non UI editable, id, TS_VECTOR / POSITION / ACTOR / RATING, and relations other than MANY_TO_ONE), when the object has no engine record form tab, or when the (tab, field) pair is already synced. Unlike the record page, the label identifier gets a widget: a creation form must let the user fill it.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const sourceFlatFieldMetadata =
      flatFieldMetadata as UniversalFlatFieldMetadata;

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

    const { applicationUniversalIdentifier } = parentFlatObjectMetadata;

    const recordFormPageLayoutTabUniversalIdentifier =
      getSystemPageLayoutTabUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          applicationUniversalIdentifier,
        pageLayoutUniversalIdentifier:
          getSystemRecordFormPageLayoutUniversalIdentifier({
            objectMetadataApplicationUniversalIdentifier:
              applicationUniversalIdentifier,
            objectUniversalIdentifier: objectMetadataUniversalIdentifier,
          }),
        title: RECORD_FORM_TAB_PROPS.title,
      });

    const parentObjectCreatedInSameBatch = isDefined(
      allFlatEntityOperationRecordByMetadataName.objectMetadata
        ?.flatEntityToCreate[objectMetadataUniversalIdentifier],
    );

    const flatPageLayoutWidgetToCreate = parentObjectCreatedInSameBatch
      ? this.buildRecordFormWidgetForObjectCreatedInSameBatch({
          sourceFlatFieldMetadata,
          labelIdentifierFieldMetadataUniversalIdentifier:
            parentFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
          recordFormPageLayoutTabUniversalIdentifier,
          allFlatEntityOperationRecordByMetadataName,
        })
      : computeRecordFormWidgetForExistingObject({
          sourceFlatFieldMetadata,
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
    labelIdentifierFieldMetadataUniversalIdentifier,
    recordFormPageLayoutTabUniversalIdentifier,
    allFlatEntityOperationRecordByMetadataName,
  }: {
    sourceFlatFieldMetadata: UniversalFlatFieldMetadata;
    labelIdentifierFieldMetadataUniversalIdentifier: string | null;
    recordFormPageLayoutTabUniversalIdentifier: string;
    allFlatEntityOperationRecordByMetadataName: BuildSideEffectsArgs<'fieldMetadata'>['allFlatEntityOperationRecordByMetadataName'];
  }): UniversalFlatPageLayoutWidget | undefined {
    const orderedFormFlatFieldMetadatas = computeRecordFormFlatFieldMetadatas({
      flatFieldMetadatas: computeCallerFlatFieldMetadatasForObject({
        objectMetadataUniversalIdentifier:
          sourceFlatFieldMetadata.objectMetadataUniversalIdentifier,
        labelIdentifierFieldMetadataUniversalIdentifier,
        allFlatEntityOperationRecordByMetadataName,
      }),
      labelIdentifierFieldMetadataUniversalIdentifier,
    });

    const index = orderedFormFlatFieldMetadatas.findIndex(
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
