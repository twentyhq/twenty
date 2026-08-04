import { Injectable } from '@nestjs/common';

import { fromArrayToUniqueKeyRecord } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { computeCallerFlatFieldMetadatasForObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-caller-flat-field-metadatas-for-object.util';
import { computeDefaultIndexViewFieldPositionByFieldUniversalIdentifier } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-default-index-view-field-position-by-field-universal-identifier.util';
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
      'When an object is created, provision (1) its 7 reserved system fields (id, createdAt, updatedAt, deletedAt, createdBy, updatedBy, position; searchVector is handled by objectSearchVectorOnCreate, and the name field is caller-provided) and (2) its default INDEX table view ("All {objectLabelPlural}") with one view field per displayable SYSTEM field only, all isSystemSideEffect so the engine owns their lifecycle. View fields for caller-provided fields are owned by fieldSystemViewFieldsOnCreate (the field creation side effect), which positions them before the system view fields; both handlers derive positions from the same caller-input list so the layout is contiguous without any ordering dependency. The view identifier is name-free (object identifier + INDEX view key), so an object rename keeps the same view. The engine is the sole owner of the INDEX view and always emits it: the flat view validator rejects caller-created INDEX views (caller inputs are forced isSystemSideEffect: false) and enforces a single non-deleted INDEX view per object. twenty-standard is not concerned: it synchronizes through the from/to migration path, which never runs the side-effect engine, and authors its own curated INDEX view/fields.',
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

    const callerFlatFieldMetadatas = computeCallerFlatFieldMetadatasForObject({
      objectMetadataUniversalIdentifier: universalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier:
        sourceFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
    });

    const positionByFieldUniversalIdentifier =
      computeDefaultIndexViewFieldPositionByFieldUniversalIdentifier({
        applicationUniversalIdentifier,
        objectMetadataUniversalIdentifier: universalIdentifier,
        labelIdentifierFieldMetadataUniversalIdentifier:
          sourceFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
        callerFlatFieldMetadatas,
      });

    const flatViewFieldsToCreate = computeFlatViewFieldsToCreate({
      objectFlatFieldMetadatas: systemFlatFieldMetadatas,
      viewUniversalIdentifier: flatIndexViewToCreate.universalIdentifier,
      applicationUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier:
        sourceFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
    }).map((flatViewFieldToCreate) => ({
      ...flatViewFieldToCreate,
      position:
        positionByFieldUniversalIdentifier.get(
          flatViewFieldToCreate.fieldMetadataUniversalIdentifier,
        ) ?? flatViewFieldToCreate.position,
    }));

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
