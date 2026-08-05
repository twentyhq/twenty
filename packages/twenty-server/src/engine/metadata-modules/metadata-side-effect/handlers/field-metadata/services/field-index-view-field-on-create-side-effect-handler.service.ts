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
import {
  computeSameBatchViewFieldPositionByFieldUniversalIdentifier,
  type ParentFlatObjectMetadataForViewFields,
} from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-same-batch-view-field-position-by-field-universal-identifier.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

@Injectable()
export class FieldIndexViewFieldOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'fieldMetadata',
    name: 'fieldIndexViewFieldOnCreate',
    description:
      'When a caller-provided field is created, provision its visible engine-owned view field on the parent object INDEX table view (every caller-provided field, relations included; engine-emitted fields get their view fields from the handler that emits them). On same-batch object+field creation the position derives statelessly from the caller-then-system contract shared with objectIndexViewOnCreate, so the layout is contiguous without ordering dependency. On an existing object the view field appends after the existing active positions, except the label identifier, which is placed strictly lowest as the flat view field validator requires. Noop when the object INDEX view does not exist under its derived identifier (unreconciled workspace). A second writer claiming the same (view, field) pair is not deferred to: it is a genuine conflict left to surface downstream (engine collision, then the flat view field validator on the pair). The record-page counterpart is fieldRecordPageViewFieldOnCreate.',
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

    if (!isDefined(flatIndexViewFieldToCreate)) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        viewField: {
          flatEntityToCreate: {
            [flatIndexViewFieldToCreate.universalIdentifier]:
              flatIndexViewFieldToCreate,
          },
        },
      },
    };
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
    const positionByFieldUniversalIdentifier =
      computeSameBatchViewFieldPositionByFieldUniversalIdentifier({
        sourceFlatFieldMetadata,
        parentFlatObjectMetadata,
        allFlatEntityOperationRecordByMetadataName,
        labelIdentifierPolicy: 'displayedFirst',
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
