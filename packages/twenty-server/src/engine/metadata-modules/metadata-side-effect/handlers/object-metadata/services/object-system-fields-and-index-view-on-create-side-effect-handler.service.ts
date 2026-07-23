import { Injectable } from '@nestjs/common';

import { fromArrayToUniqueKeyRecord, isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { computeCallerFlatFieldMetadatasForObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-caller-flat-field-metadatas-for-object.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { buildReservedSystemFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-reserved-system-flat-field-metadatas-for-custom-object.util';
import { computeFlatIndexViewToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-index-view-to-create.util';
import { computeFlatViewFieldsToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-view-fields-to-create.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

@Injectable()
export class ObjectSystemFieldsAndIndexViewOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'objectMetadata',
    name: 'objectSystemFieldsAndIndexViewOnCreate',
    description:
      'When an object is created, provision (1) its 7 reserved system fields (id, createdAt, updatedAt, deletedAt, createdBy, updatedBy, position; searchVector is handled by objectSearchVectorOnCreate, and the name field is caller-provided) and (2) its default INDEX table view ("All {objectLabelPlural}") with one view field per displayable SYSTEM field only, all isSystemSideEffect so the engine owns their lifecycle. View fields for caller-provided fields are owned by fieldIndexViewFieldOnCreate (the field creation side effect), which positions them before the system view fields; both handlers derive positions from the same caller-input list so the layout is contiguous without any ordering dependency. The view identifier is name-free (object identifier + INDEX view key), so an object rename keeps the same view. When the caller already provides the INDEX view (override), only the system fields are emitted. twenty-standard is not concerned: it synchronizes through the from/to migration path, which never runs the side-effect engine, and authors its own curated INDEX view/fields.',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const sourceFlatObjectMetadata =
      flatObjectMetadata as UniversalFlatObjectMetadata;
    const { applicationUniversalIdentifier, universalIdentifier } =
      sourceFlatObjectMetadata;

    // The 7 reserved system fields, computed locally so the INDEX view below can
    // reference them without depending on another handler's execution order.
    const systemFlatFieldMetadatas = Object.values(
      buildReservedSystemFlatFieldMetadatasForCustomObject({
        flatObjectMetadata: {
          applicationUniversalIdentifier,
          universalIdentifier,
        },
      }),
    );

    const systemFieldMetadataToCreate: Record<
      string,
      MetadataUniversalFlatEntity<'fieldMetadata'>
    > = {};

    for (const systemFlatFieldMetadata of systemFlatFieldMetadatas) {
      systemFieldMetadataToCreate[systemFlatFieldMetadata.universalIdentifier] =
        systemFlatFieldMetadata;
    }

    const flatIndexViewToCreate = computeFlatIndexViewToCreate({
      objectMetadata: sourceFlatObjectMetadata,
      applicationUniversalIdentifier,
    });

    // When the caller already provides the INDEX view (same derived identifier),
    // it fully owns the view and its view fields; we still own the system fields.
    const callerProvidedIndexView =
      allFlatEntityOperationRecordByMetadataName.view?.flatEntityToCreate[
        flatIndexViewToCreate.universalIdentifier
      ];

    if (isDefined(callerProvidedIndexView)) {
      return {
        status: 'success',
        operations: {
          fieldMetadata: { flatEntityToCreate: systemFieldMetadataToCreate },
        },
      };
    }

    const systemFieldUniversalIdentifiers = new Set(
      systemFlatFieldMetadatas.map(
        (flatFieldMetadata) => flatFieldMetadata.universalIdentifier,
      ),
    );

    const displayableCallerFlatFieldMetadatas =
      computeCallerFlatFieldMetadatasForObject({
        objectMetadataUniversalIdentifier: universalIdentifier,
        labelIdentifierFieldMetadataUniversalIdentifier:
          sourceFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
        reservedSystemFieldUniversalIdentifiers:
          systemFieldUniversalIdentifiers,
        allFlatEntityOperationRecordByMetadataName,
        displayableOnly: true,
      });

    const flatViewFieldsToCreate = computeFlatViewFieldsToCreate({
      objectFlatFieldMetadatas: systemFlatFieldMetadatas,
      viewUniversalIdentifier: flatIndexViewToCreate.universalIdentifier,
      applicationUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier:
        sourceFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
      startPosition: displayableCallerFlatFieldMetadatas.length,
    });

    return {
      status: 'success',
      operations: {
        fieldMetadata: { flatEntityToCreate: systemFieldMetadataToCreate },
        view: {
          flatEntityToCreate: {
            [flatIndexViewToCreate.universalIdentifier]: flatIndexViewToCreate,
          },
        },
        viewField: {
          flatEntityToCreate: fromArrayToUniqueKeyRecord({
            array: flatViewFieldsToCreate,
            uniqueKey: 'universalIdentifier',
          }),
        },
      },
    };
  }
}
