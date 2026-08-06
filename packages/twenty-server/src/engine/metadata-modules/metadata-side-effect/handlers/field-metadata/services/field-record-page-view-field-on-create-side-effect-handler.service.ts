import { Injectable } from '@nestjs/common';

import {
  getSystemViewFieldUniversalIdentifier,
  getSystemViewUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { buildFieldSideEffectParentNotFoundFailure } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/build-field-side-effect-parent-not-found-failure.util';
import { resolveParentFlatObjectMetadataAfterStateForFieldSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/resolve-parent-flat-object-metadata-after-state-for-field-side-effect.util';
import { computeRecordPageViewFieldForExistingObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-record-page-view-field-for-existing-object.util';
import {
  computeSameBatchViewFieldPositionByFieldUniversalIdentifier,
  type ParentFlatObjectMetadataForViewFields,
} from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-same-batch-view-field-position-by-field-universal-identifier.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { isFlatFieldMetadataDisplayableInDefaultView } from 'src/engine/metadata-modules/object-metadata/utils/is-flat-field-metadata-displayable-in-default-view.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

@Injectable()
export class FieldRecordPageViewFieldOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'fieldMetadata',
    name: 'fieldRecordPageViewFieldOnCreate',
    description:
      'When a caller-provided field is created, provision its engine-owned view field on the engine-owned FIELDS_WIDGET record-page view, resolved strictly by its derived universal identifier. On an existing object the emission is widget-driven: visibility follows the FIELDS widget newFieldDefaultVisibility and the view field appends into the last active view field group, degrading to no group (the common case: custom objects are created with zero groups). On same-batch object+field creation no widget map exists yet, so the default widget configuration is derived statelessly from the constant (visible, no group, deterministic caller-then-system position shared with objectRecordPageOnCreate). Noop when the object has no engine record-page view, when no active FIELDS widget references it, when the widget does not declare newFieldDefaultVisibility, when the field is the object label identifier (the record page displays it in the title), or when the (view, field) pair is already synced, whatever its identifier. A caller-pending view field for the same pair is not deferred to: the engine always produces its system side effects, and the pair-uniqueness validator surfaces the conflict to the caller, exactly like INDEX. The INDEX counterpart is fieldIndexViewFieldOnCreate.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const sourceFlatFieldMetadata =
      flatFieldMetadata as UniversalFlatFieldMetadata;
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

    const recordPageViewUniversalIdentifier = getSystemViewUniversalIdentifier({
      objectMetadataApplicationUniversalIdentifier:
        parentFlatObjectMetadata.applicationUniversalIdentifier,
      objectUniversalIdentifier: objectMetadataUniversalIdentifier,
      viewKey: ViewKey.FIELDS_WIDGET,
    });

    const parentObjectCreatedInSameBatch = isDefined(
      allFlatEntityOperationRecordByMetadataName.objectMetadata
        ?.flatEntityToCreate[objectMetadataUniversalIdentifier],
    );

    const flatRecordPageViewFieldToCreate = parentObjectCreatedInSameBatch
      ? this.buildRecordPageViewFieldForObjectCreatedInSameBatch({
          sourceFlatFieldMetadata,
          parentFlatObjectMetadata,
          recordPageViewUniversalIdentifier,
          allFlatEntityOperationRecordByMetadataName,
        })
      : this.buildRecordPageViewFieldForExistingObject({
          sourceFlatFieldMetadata,
          parentFlatObjectMetadata,
          recordPageViewUniversalIdentifier,
          relatedFlatEntityMaps,
        });

    if (!isDefined(flatRecordPageViewFieldToCreate)) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        viewField: {
          flatEntityToCreate: {
            [flatRecordPageViewFieldToCreate.universalIdentifier]:
              flatRecordPageViewFieldToCreate,
          },
        },
      },
    };
  }

  private buildRecordPageViewFieldForObjectCreatedInSameBatch({
    sourceFlatFieldMetadata,
    parentFlatObjectMetadata,
    recordPageViewUniversalIdentifier,
    allFlatEntityOperationRecordByMetadataName,
  }: {
    sourceFlatFieldMetadata: UniversalFlatFieldMetadata;
    parentFlatObjectMetadata: ParentFlatObjectMetadataForViewFields;
    recordPageViewUniversalIdentifier: string;
    allFlatEntityOperationRecordByMetadataName: BuildSideEffectsArgs<'fieldMetadata'>['allFlatEntityOperationRecordByMetadataName'];
  }): UniversalFlatViewField | undefined {
    const { labelIdentifierFieldMetadataUniversalIdentifier } =
      parentFlatObjectMetadata;

    if (
      sourceFlatFieldMetadata.universalIdentifier ===
        labelIdentifierFieldMetadataUniversalIdentifier ||
      !isFlatFieldMetadataDisplayableInDefaultView({
        flatFieldMetadata: sourceFlatFieldMetadata,
        labelIdentifierFieldMetadataUniversalIdentifier,
      })
    ) {
      return undefined;
    }

    const positionByFieldUniversalIdentifier =
      computeSameBatchViewFieldPositionByFieldUniversalIdentifier({
        sourceFlatFieldMetadata,
        parentFlatObjectMetadata,
        allFlatEntityOperationRecordByMetadataName,
        labelIdentifierPolicy: 'excluded',
      });

    const createdAt = new Date().toISOString();
    const { applicationUniversalIdentifier } = sourceFlatFieldMetadata;

    return {
      universalIdentifier: getSystemViewFieldUniversalIdentifier({
        fieldMetadataApplicationUniversalIdentifier:
          applicationUniversalIdentifier,
        viewUniversalIdentifier: recordPageViewUniversalIdentifier,
        fieldMetadataUniversalIdentifier:
          sourceFlatFieldMetadata.universalIdentifier,
      }),
      applicationUniversalIdentifier,
      fieldMetadataUniversalIdentifier:
        sourceFlatFieldMetadata.universalIdentifier,
      viewUniversalIdentifier: recordPageViewUniversalIdentifier,
      viewFieldGroupUniversalIdentifier: null,
      isVisible: true,
      size: DEFAULT_VIEW_FIELD_SIZE,
      position:
        positionByFieldUniversalIdentifier.get(
          sourceFlatFieldMetadata.universalIdentifier,
        ) ?? 0,
      aggregateOperation: null,
      isActive: true,
      isSystemSideEffect: true,
      universalOverrides: null,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    };
  }

  private buildRecordPageViewFieldForExistingObject({
    sourceFlatFieldMetadata,
    parentFlatObjectMetadata,
    recordPageViewUniversalIdentifier,
    relatedFlatEntityMaps,
  }: {
    sourceFlatFieldMetadata: UniversalFlatFieldMetadata;
    parentFlatObjectMetadata: ParentFlatObjectMetadataForViewFields;
    recordPageViewUniversalIdentifier: string;
    relatedFlatEntityMaps: BuildSideEffectsArgs<'fieldMetadata'>['relatedFlatEntityMaps'];
  }): UniversalFlatViewField | undefined {
    if (
      sourceFlatFieldMetadata.universalIdentifier ===
      parentFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier
    ) {
      return undefined;
    }

    const existingRecordPageFlatView =
      relatedFlatEntityMaps.flatViewMaps.byUniversalIdentifier[
        recordPageViewUniversalIdentifier
      ];

    // Synced pair dedup, whatever the existing row identifier.
    const pairAlreadySynced =
      isDefined(existingRecordPageFlatView) &&
      existingRecordPageFlatView.viewFieldUniversalIdentifiers.some(
        (viewFieldUniversalIdentifier) => {
          const existingFlatViewField =
            relatedFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier[
              viewFieldUniversalIdentifier
            ];

          return (
            isDefined(existingFlatViewField) &&
            existingFlatViewField.fieldMetadataUniversalIdentifier ===
              sourceFlatFieldMetadata.universalIdentifier &&
            !isDefined(existingFlatViewField.deletedAt)
          );
        },
      );

    if (pairAlreadySynced) {
      return undefined;
    }

    return computeRecordPageViewFieldForExistingObject({
      sourceFlatFieldMetadata,
      recordPageViewUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier:
        parentFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
      flatViewMaps: relatedFlatEntityMaps.flatViewMaps,
      flatViewFieldMaps: relatedFlatEntityMaps.flatViewFieldMaps,
      flatViewFieldGroupMaps: relatedFlatEntityMaps.flatViewFieldGroupMaps,
      flatPageLayoutWidgetMaps: relatedFlatEntityMaps.flatPageLayoutWidgetMaps,
    });
  }
}
