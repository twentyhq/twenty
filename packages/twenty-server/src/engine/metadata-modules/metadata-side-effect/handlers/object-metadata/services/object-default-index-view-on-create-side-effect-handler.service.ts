import { Injectable } from '@nestjs/common';

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { fromArrayToUniqueKeyRecord, isDefined } from 'twenty-shared/utils';

import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { computeFlatIndexViewToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-index-view-to-create.util';
import { computeFlatViewFieldsToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-view-fields-to-create.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

@Injectable()
export class ObjectDefaultIndexViewOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'objectMetadata',
    name: 'objectDefaultIndexViewOnCreate',
    description:
      'When an object is created, provision its default INDEX table view ("All {objectLabelPlural}") and one view field per displayable field, all isSystemSideEffect so the engine owns their lifecycle. The view identifier is name-free (keyed on the object identifier + the INDEX view key), so an object rename keeps the same view. Registered last among create:objectMetadata handlers so it reads the caller field plus the system fields already emitted into the expanded matrix. Returns noop for twenty-standard (which authors its own curated INDEX view/fields) and when the caller already provides the INDEX view (override).',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    // twenty-standard authors its own curated INDEX view + view fields (a
    // different set than the generic default), so collision-skip alone would
    // wrongly add unwanted view fields: gate it out entirely.
    if (
      flatObjectMetadata.applicationUniversalIdentifier ===
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
    ) {
      return { status: 'noop' };
    }

    const sourceFlatObjectMetadata =
      flatObjectMetadata as UniversalFlatObjectMetadata;

    const flatIndexViewToCreate = computeFlatIndexViewToCreate({
      objectMetadata: sourceFlatObjectMetadata,
      applicationUniversalIdentifier:
        sourceFlatObjectMetadata.applicationUniversalIdentifier,
    });

    // When the caller already provides the INDEX view (same derived
    // identifier), it fully owns the view and its view fields.
    const callerProvidedIndexView =
      allFlatEntityOperationRecordByMetadataName.view?.flatEntityToCreate[
        flatIndexViewToCreate.universalIdentifier
      ];

    if (isDefined(callerProvidedIndexView)) {
      return { status: 'noop' };
    }

    // Read the fields emitted for this object into the expanded matrix (caller
    // field + system fields from earlier create:objectMetadata handlers), so we
    // do not re-derive the reserved system fields.
    const objectFlatFieldMetadatas = (
      Object.values(
        allFlatEntityOperationRecordByMetadataName.fieldMetadata
          ?.flatEntityToCreate ?? {},
      ) as UniversalFlatFieldMetadata[]
    ).filter(
      (flatFieldMetadata) =>
        flatFieldMetadata.objectMetadataUniversalIdentifier ===
        sourceFlatObjectMetadata.universalIdentifier,
    );

    const flatViewFieldsToCreate = computeFlatViewFieldsToCreate({
      objectFlatFieldMetadatas,
      viewUniversalIdentifier: flatIndexViewToCreate.universalIdentifier,
      applicationUniversalIdentifier:
        sourceFlatObjectMetadata.applicationUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier:
        sourceFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
    });

    return {
      status: 'success',
      operations: {
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
