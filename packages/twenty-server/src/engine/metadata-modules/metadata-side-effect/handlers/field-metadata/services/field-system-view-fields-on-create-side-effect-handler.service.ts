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
import { computeCallerFlatFieldMetadatasForObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-caller-flat-field-metadatas-for-object.util';
import { computeDefaultIndexViewFieldPositionByFieldUniversalIdentifier } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-default-index-view-field-position-by-field-universal-identifier.util';
import { computeDefaultRecordPageViewFieldPositionByFieldUniversalIdentifier } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-default-record-page-view-field-position-by-field-universal-identifier.util';
import { computeRecordPageViewFieldForExistingObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-record-page-view-field-for-existing-object.util';
import { objectCarriesCallerAuthoredRecordPageStack } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/object-carries-caller-authored-record-page-stack.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { isFlatFieldMetadataDisplayableInDefaultView } from 'src/engine/metadata-modules/object-metadata/utils/is-flat-field-metadata-displayable-in-default-view.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

type ParentFlatObjectMetadataForViewFields = {
  applicationUniversalIdentifier: string;
  labelIdentifierFieldMetadataUniversalIdentifier: string | null;
};

@Injectable()
export class FieldSystemViewFieldsOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'fieldMetadata',
    name: 'fieldSystemViewFieldsOnCreate',
    description:
      'When a field is created, provision its engine-owned view fields: a visible one on the parent object INDEX table view (every caller-provided field, relations included), and one on the engine-owned FIELDS_WIDGET record-page view. Owns the view fields of every caller-provided field; engine-emitted fields get theirs from the handler that emits them. The record-page emission is narrowed to the engine-owned record-page view, resolved strictly by its derived universal identifier: visibility follows the FIELDS widget newFieldDefaultVisibility and the view field appends into the last active view field group, degrading to no group (the common case: custom objects are created with zero groups). It noops when the object has no engine record-page view, when no active FIELDS widget references it, when the widget does not declare newFieldDefaultVisibility, when the field is the object label identifier (the record page excludes it), or when the (view, field) pair already exists pending or synced, whatever its identifier. On same-batch object+field creation no widget map exists yet, so the default widget configuration is derived statelessly from the constant (visible, no group, deterministic caller-then-system position), unless the batch carries a caller-authored record-page stack, in which case the record-page emission noops together with objectRecordPageOnCreate.',
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

    const indexViewUniversalIdentifier = getSystemViewUniversalIdentifier({
      objectMetadataApplicationUniversalIdentifier:
        parentFlatObjectMetadata.applicationUniversalIdentifier,
      objectUniversalIdentifier: objectMetadataUniversalIdentifier,
      viewKey: ViewKey.INDEX,
    });

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

    const flatIndexViewFieldToCreate = parentObjectCreatedInSameBatch
      ? this.buildIndexViewFieldForObjectCreatedInSameBatch({
          sourceFlatFieldMetadata,
          parentFlatObjectMetadata,
          indexViewUniversalIdentifier,
          allFlatEntityOperationRecordByMetadataName,
        })
      : this.buildIndexViewFieldForExistingObject({
          sourceFlatFieldMetadata,
          parentFlatObjectMetadata,
          indexViewUniversalIdentifier,
          allFlatEntityOperationRecordByMetadataName,
          relatedFlatEntityMaps,
        });

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

    // Pair dedup is record-page only: a second writer claiming the same INDEX
    // (view, field) pair is a genuine conflict left to surface downstream
    // (engine collision, then the flat view field validator on the pair).
    const dedupedFlatRecordPageViewFieldToCreate =
      isDefined(flatRecordPageViewFieldToCreate) &&
      !this.viewFieldPairAlreadyPending({
        flatViewFieldToCreate: flatRecordPageViewFieldToCreate,
        allFlatEntityOperationRecordByMetadataName,
      })
        ? flatRecordPageViewFieldToCreate
        : undefined;

    const flatViewFieldsToCreate = [
      flatIndexViewFieldToCreate,
      dedupedFlatRecordPageViewFieldToCreate,
    ].filter(isDefined);

    if (flatViewFieldsToCreate.length === 0) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        viewField: {
          flatEntityToCreate: Object.fromEntries(
            flatViewFieldsToCreate.map((flatViewFieldToCreate) => [
              flatViewFieldToCreate.universalIdentifier,
              flatViewFieldToCreate,
            ]),
          ),
        },
      },
    };
  }

  private viewFieldPairAlreadyPending({
    flatViewFieldToCreate,
    allFlatEntityOperationRecordByMetadataName,
  }: {
    flatViewFieldToCreate: UniversalFlatViewField;
    allFlatEntityOperationRecordByMetadataName: BuildSideEffectsArgs<'fieldMetadata'>['allFlatEntityOperationRecordByMetadataName'];
  }): boolean {
    const pendingFlatViewFields = Object.values(
      allFlatEntityOperationRecordByMetadataName.viewField
        ?.flatEntityToCreate ?? {},
    ) as UniversalFlatViewField[];

    return pendingFlatViewFields.some(
      (pendingFlatViewField) =>
        pendingFlatViewField.viewUniversalIdentifier ===
          flatViewFieldToCreate.viewUniversalIdentifier &&
        pendingFlatViewField.fieldMetadataUniversalIdentifier ===
          flatViewFieldToCreate.fieldMetadataUniversalIdentifier,
    );
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

    // Field handlers run before object handlers, so the engine record-page
    // view is never pending yet; noop only when the caller authored its own
    // stack, in which case objectRecordPageOnCreate will not emit the view.
    if (
      objectCarriesCallerAuthoredRecordPageStack({
        objectMetadataUniversalIdentifier:
          sourceFlatFieldMetadata.objectMetadataUniversalIdentifier,
        allFlatEntityOperationRecordByMetadataName,
      })
    ) {
      return undefined;
    }

    const callerFlatFieldMetadatas = computeCallerFlatFieldMetadatasForObject({
      objectMetadataUniversalIdentifier:
        sourceFlatFieldMetadata.objectMetadataUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
    });

    const positionByFieldUniversalIdentifier =
      computeDefaultRecordPageViewFieldPositionByFieldUniversalIdentifier({
        applicationUniversalIdentifier:
          parentFlatObjectMetadata.applicationUniversalIdentifier,
        objectMetadataUniversalIdentifier:
          sourceFlatFieldMetadata.objectMetadataUniversalIdentifier,
        labelIdentifierFieldMetadataUniversalIdentifier,
        callerFlatFieldMetadatas,
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
    // The record page excludes the label identifier view field.
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
      flatViewMaps: relatedFlatEntityMaps.flatViewMaps,
      flatViewFieldMaps: relatedFlatEntityMaps.flatViewFieldMaps,
      flatViewFieldGroupMaps: relatedFlatEntityMaps.flatViewFieldGroupMaps,
      flatPageLayoutWidgetMaps: relatedFlatEntityMaps.flatPageLayoutWidgetMaps,
    });
  }

  private buildIndexViewFieldForObjectCreatedInSameBatch({
    sourceFlatFieldMetadata,
    parentFlatObjectMetadata,
    indexViewUniversalIdentifier,
    allFlatEntityOperationRecordByMetadataName,
  }: {
    sourceFlatFieldMetadata: UniversalFlatFieldMetadata;
    parentFlatObjectMetadata: ParentFlatObjectMetadataForViewFields;
    indexViewUniversalIdentifier: string;
    allFlatEntityOperationRecordByMetadataName: BuildSideEffectsArgs<'fieldMetadata'>['allFlatEntityOperationRecordByMetadataName'];
  }): UniversalFlatViewField {
    const { labelIdentifierFieldMetadataUniversalIdentifier } =
      parentFlatObjectMetadata;

    const callerFlatFieldMetadatas = computeCallerFlatFieldMetadatasForObject({
      objectMetadataUniversalIdentifier:
        sourceFlatFieldMetadata.objectMetadataUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
    });

    const positionByFieldUniversalIdentifier =
      computeDefaultIndexViewFieldPositionByFieldUniversalIdentifier({
        applicationUniversalIdentifier:
          parentFlatObjectMetadata.applicationUniversalIdentifier,
        objectMetadataUniversalIdentifier:
          sourceFlatFieldMetadata.objectMetadataUniversalIdentifier,
        labelIdentifierFieldMetadataUniversalIdentifier,
        callerFlatFieldMetadatas,
      });

    const position =
      positionByFieldUniversalIdentifier.get(
        sourceFlatFieldMetadata.universalIdentifier,
      ) ?? 0;

    return this.buildIndexFlatViewFieldToCreate({
      sourceFlatFieldMetadata,
      indexViewUniversalIdentifier,
      position,
    });
  }

  private buildIndexViewFieldForExistingObject({
    sourceFlatFieldMetadata,
    parentFlatObjectMetadata,
    indexViewUniversalIdentifier,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: {
    sourceFlatFieldMetadata: UniversalFlatFieldMetadata;
    parentFlatObjectMetadata: ParentFlatObjectMetadataForViewFields;
    indexViewUniversalIdentifier: string;
    allFlatEntityOperationRecordByMetadataName: BuildSideEffectsArgs<'fieldMetadata'>['allFlatEntityOperationRecordByMetadataName'];
    relatedFlatEntityMaps: BuildSideEffectsArgs<'fieldMetadata'>['relatedFlatEntityMaps'];
  }): UniversalFlatViewField | undefined {
    const existingIndexFlatView =
      relatedFlatEntityMaps.flatViewMaps.byUniversalIdentifier[
        indexViewUniversalIdentifier
      ];

    if (
      !isDefined(existingIndexFlatView) ||
      isDefined(existingIndexFlatView.deletedAt)
    ) {
      return undefined;
    }

    const existingActivePositions =
      existingIndexFlatView.viewFieldUniversalIdentifiers
        .map(
          (viewFieldUniversalIdentifier) =>
            relatedFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier[
              viewFieldUniversalIdentifier
            ],
        )
        .filter(isDefined)
        .filter(
          (existingFlatViewField) =>
            existingFlatViewField.isActive &&
            !isDefined(existingFlatViewField.deletedAt),
        )
        .map((existingFlatViewField) => existingFlatViewField.position);

    const isLabelIdentifierField =
      sourceFlatFieldMetadata.universalIdentifier ===
      parentFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier;

    if (isLabelIdentifierField) {
      const lowestExistingPosition =
        existingActivePositions.length > 0
          ? Math.min(...existingActivePositions)
          : 1;

      return this.buildIndexFlatViewFieldToCreate({
        sourceFlatFieldMetadata,
        indexViewUniversalIdentifier,
        position: lowestExistingPosition - 1,
      });
    }

    const appendBasePosition =
      existingActivePositions.reduce(
        (maxPosition, position) => Math.max(maxPosition, position),
        -1,
      ) + 1;

    const callerFlatFieldMetadatas = computeCallerFlatFieldMetadatasForObject({
      objectMetadataUniversalIdentifier:
        sourceFlatFieldMetadata.objectMetadataUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier:
        parentFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
    });

    const indexAmongCallerFlatFieldMetadatas = Math.max(
      callerFlatFieldMetadatas.findIndex(
        (callerFlatFieldMetadata) =>
          callerFlatFieldMetadata.universalIdentifier ===
          sourceFlatFieldMetadata.universalIdentifier,
      ),
      0,
    );

    return this.buildIndexFlatViewFieldToCreate({
      sourceFlatFieldMetadata,
      indexViewUniversalIdentifier,
      position: appendBasePosition + indexAmongCallerFlatFieldMetadatas,
    });
  }

  private buildIndexFlatViewFieldToCreate({
    sourceFlatFieldMetadata,
    indexViewUniversalIdentifier,
    position,
  }: {
    sourceFlatFieldMetadata: UniversalFlatFieldMetadata;
    indexViewUniversalIdentifier: string;
    position: number;
  }): UniversalFlatViewField {
    const createdAt = new Date().toISOString();
    const { applicationUniversalIdentifier } = sourceFlatFieldMetadata;

    return {
      universalIdentifier: getSystemViewFieldUniversalIdentifier({
        fieldMetadataApplicationUniversalIdentifier:
          applicationUniversalIdentifier,
        viewUniversalIdentifier: indexViewUniversalIdentifier,
        fieldMetadataUniversalIdentifier:
          sourceFlatFieldMetadata.universalIdentifier,
      }),
      applicationUniversalIdentifier,
      fieldMetadataUniversalIdentifier:
        sourceFlatFieldMetadata.universalIdentifier,
      viewUniversalIdentifier: indexViewUniversalIdentifier,
      viewFieldGroupUniversalIdentifier: null,
      isVisible: true,
      size: DEFAULT_VIEW_FIELD_SIZE,
      position,
      aggregateOperation: null,
      isActive: true,
      isSystemSideEffect: true,
      universalOverrides: null,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    };
  }
}
