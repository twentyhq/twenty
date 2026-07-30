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
      'When a field is created, provision its visible view field on the parent object INDEX view. Owns the view fields of every caller-provided field; engine-emitted fields get theirs from the handler that emits them. Noop when the field is not displayable in the default view (object created in the same batch) or when the object has no active INDEX view (pre-existing object).',
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
      applicationUniversalIdentifier: string;
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

    const positionByFieldUniversalIdentifier =
      computeDefaultIndexViewFieldPositionByFieldUniversalIdentifier({
        applicationUniversalIdentifier:
          parentFlatObjectMetadata.applicationUniversalIdentifier,
        objectMetadataUniversalIdentifier:
          sourceFlatFieldMetadata.objectMetadataUniversalIdentifier,
        labelIdentifierFieldMetadataUniversalIdentifier,
        displayableCallerFlatFieldMetadatas,
      });

    const position =
      positionByFieldUniversalIdentifier.get(
        sourceFlatFieldMetadata.universalIdentifier,
      ) ?? 0;

    const [flatViewFieldToCreate] = computeFlatViewFieldsToCreate({
      objectFlatFieldMetadatas: [sourceFlatFieldMetadata],
      viewUniversalIdentifier: indexViewUniversalIdentifier,
      applicationUniversalIdentifier:
        sourceFlatFieldMetadata.applicationUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier,
      startPosition: position,
    });

    return flatViewFieldToCreate;
  }

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
      const [flatLabelViewFieldToCreate] = computeFlatViewFieldsToCreate({
        objectFlatFieldMetadatas: [sourceFlatFieldMetadata],
        viewUniversalIdentifier: indexViewUniversalIdentifier,
        applicationUniversalIdentifier:
          sourceFlatFieldMetadata.applicationUniversalIdentifier,
        labelIdentifierFieldMetadataUniversalIdentifier:
          parentFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
        startPosition: lowestExistingPosition - 1,
      });

      return flatLabelViewFieldToCreate;
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
