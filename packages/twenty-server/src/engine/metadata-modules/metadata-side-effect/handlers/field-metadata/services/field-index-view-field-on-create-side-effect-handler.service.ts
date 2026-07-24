import { Injectable } from '@nestjs/common';

import {
  getSystemViewUniversalIdentifier,
  getViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { buildFieldSideEffectParentNotFoundFailure } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/build-field-side-effect-parent-not-found-failure.util';
import { resolveParentFlatObjectMetadataAfterStateForFieldSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/resolve-parent-flat-object-metadata-after-state-for-field-side-effect.util';
import { computeCallerFlatFieldMetadatasForObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-caller-flat-field-metadatas-for-object.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { computeFlatViewFieldsToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-view-fields-to-create.util';
import { isFlatFieldMetadataDisplayableInDefaultView } from 'src/engine/metadata-modules/object-metadata/utils/is-flat-field-metadata-displayable-in-default-view.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatViewField } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-field.type';

@Injectable()
export class FieldIndexViewFieldOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'fieldMetadata',
    name: 'fieldIndexViewFieldOnCreate',
    description:
      'When a field is created, provision its view field on the parent object INDEX view. This handler owns the view fields of every caller-provided field. When the parent object is created in the same batch, the default view assembly applies: only displayable fields (no relations) get a visible view field, positioned before the system-field view fields emitted by objectSystemFieldsAndIndexViewOnCreate; both handlers derive positions from the same caller-input list so no ordering dependency exists. When the parent object pre-exists, every created field (relations included) gets a HIDDEN view field appended to the INDEX view, preserving the historical createOneField behavior previously implemented caller-side. Emitted view fields are always isSystemSideEffect, whatever the provenance of the view they land on: the engine authored them, so manifest sync deletion inference must never drop them. Both branches resolve the INDEX view through its name-free deterministic identifier (object identifier + INDEX key), so the lookup is a single map access and never a scan; workspaces synced before the 2-24 reconcile command hold underived INDEX view identifiers and are simply skipped until it runs. Engine-owned fields (the reserved system fields, the searchVector) never reach this handler: they are emitted as side effects and the engine only triggers handlers on the original input, so their view fields belong to the handler that emits them. Noop when the created field is not displayable in the default view (object created in the same batch) or when the object has no active INDEX view (pre-existing object). The engine owns the INDEX view, so this handler never defers to a caller-provided one: a caller providing the INDEX view, or a second writer claiming the same INDEX view field, is a genuine conflict left to surface downstream (engine universal-identifier collision, then the flat view field validator on the (view, field) pair).',
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
      applicationUniversalIdentifier:
        parentFlatObjectMetadata.applicationUniversalIdentifier,
      objectUniversalIdentifier: objectMetadataUniversalIdentifier,
      viewKey: ViewKey.INDEX,
    });

    const parentObjectCreatedInSameBatch = isDefined(
      allFlatEntityOperationRecordByMetadataName.objectMetadata
        ?.flatEntityToCreate[objectMetadataUniversalIdentifier],
    );

    const flatViewFieldToCreate = parentObjectCreatedInSameBatch
      ? this.buildViewFieldForObjectCreatedInSameBatch({
          sourceFlatFieldMetadata,
          parentFlatObjectMetadata,
          indexViewUniversalIdentifier,
          allFlatEntityOperationRecordByMetadataName,
        })
      : this.buildViewFieldForExistingObject({
          sourceFlatFieldMetadata,
          parentFlatObjectMetadata,
          indexViewUniversalIdentifier,
          allFlatEntityOperationRecordByMetadataName,
          relatedFlatEntityMaps,
        });

    if (!isDefined(flatViewFieldToCreate)) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        viewField: {
          flatEntityToCreate: {
            [flatViewFieldToCreate.universalIdentifier]: flatViewFieldToCreate,
          },
        },
      },
    };
  }

  private buildViewFieldForObjectCreatedInSameBatch({
    sourceFlatFieldMetadata,
    parentFlatObjectMetadata,
    indexViewUniversalIdentifier,
    allFlatEntityOperationRecordByMetadataName,
  }: {
    sourceFlatFieldMetadata: UniversalFlatFieldMetadata;
    parentFlatObjectMetadata: {
      labelIdentifierFieldMetadataUniversalIdentifier: string | null;
    };
    indexViewUniversalIdentifier: string;
    allFlatEntityOperationRecordByMetadataName: BuildSideEffectsArgs<'fieldMetadata'>['allFlatEntityOperationRecordByMetadataName'];
  }): UniversalFlatViewField | undefined {
    const { labelIdentifierFieldMetadataUniversalIdentifier } =
      parentFlatObjectMetadata;

    if (
      !isFlatFieldMetadataDisplayableInDefaultView({
        flatFieldMetadata: sourceFlatFieldMetadata,
        labelIdentifierFieldMetadataUniversalIdentifier,
      })
    ) {
      return undefined;
    }

    const displayableCallerFlatFieldMetadatas =
      computeCallerFlatFieldMetadatasForObject({
        objectMetadataUniversalIdentifier:
          sourceFlatFieldMetadata.objectMetadataUniversalIdentifier,
        labelIdentifierFieldMetadataUniversalIdentifier,
        allFlatEntityOperationRecordByMetadataName,
        displayableOnly: true,
      });

    const position = Math.max(
      displayableCallerFlatFieldMetadatas.findIndex(
        (displayableFlatFieldMetadata) =>
          displayableFlatFieldMetadata.universalIdentifier ===
          sourceFlatFieldMetadata.universalIdentifier,
      ),
      0,
    );

    const [flatViewFieldToCreate] = computeFlatViewFieldsToCreate({
      objectFlatFieldMetadatas: [sourceFlatFieldMetadata],
      viewUniversalIdentifier: indexViewUniversalIdentifier,
      // The view field belongs to the created field's application, not to its
      // object's one, exactly like the existing-object branch below.
      applicationUniversalIdentifier:
        sourceFlatFieldMetadata.applicationUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier,
      startPosition: position,
    });

    return flatViewFieldToCreate;
  }

  // Historical createOneField behavior: every created field gets a hidden view
  // field appended to the object INDEX view.
  private buildViewFieldForExistingObject({
    sourceFlatFieldMetadata,
    parentFlatObjectMetadata,
    indexViewUniversalIdentifier,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: {
    sourceFlatFieldMetadata: UniversalFlatFieldMetadata;
    parentFlatObjectMetadata: {
      applicationUniversalIdentifier: string;
      labelIdentifierFieldMetadataUniversalIdentifier: string | null;
    };
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
      !existingIndexFlatView.isActive ||
      isDefined(existingIndexFlatView.deletedAt)
    ) {
      return undefined;
    }

    const appendBasePosition =
      existingIndexFlatView.viewFieldUniversalIdentifiers
        .map(
          (viewFieldUniversalIdentifier) =>
            relatedFlatEntityMaps.flatViewFieldMaps.byUniversalIdentifier[
              viewFieldUniversalIdentifier
            ],
        )
        .filter(isDefined)
        .filter((existingFlatViewField) => existingFlatViewField.isActive)
        .reduce(
          (maxPosition, existingFlatViewField) =>
            Math.max(maxPosition, existingFlatViewField.position),
          -1,
        ) + 1;

    const callerFlatFieldMetadatas = computeCallerFlatFieldMetadatasForObject({
      objectMetadataUniversalIdentifier:
        sourceFlatFieldMetadata.objectMetadataUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier:
        parentFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
      displayableOnly: false,
    });

    const indexAmongCallerFlatFieldMetadatas = Math.max(
      callerFlatFieldMetadatas.findIndex(
        (callerFlatFieldMetadata) =>
          callerFlatFieldMetadata.universalIdentifier ===
          sourceFlatFieldMetadata.universalIdentifier,
      ),
      0,
    );

    const createdAt = new Date().toISOString();
    const { applicationUniversalIdentifier } = sourceFlatFieldMetadata;

    return {
      universalIdentifier: getViewFieldUniversalIdentifier({
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
      isVisible: false,
      size: DEFAULT_VIEW_FIELD_SIZE,
      position: appendBasePosition + indexAmongCallerFlatFieldMetadatas,
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
