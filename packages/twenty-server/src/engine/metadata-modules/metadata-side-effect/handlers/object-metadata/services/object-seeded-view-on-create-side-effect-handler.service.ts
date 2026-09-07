import { Injectable } from '@nestjs/common';

import { fromArrayToUniqueKeyRecord, isDefined } from 'twenty-shared/utils';

import { computeSeededObjectViewFieldsToCreate } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-seeded-object-view-fields-to-create.util';
import { computeSeededObjectViewToCreate } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-seeded-object-view-to-create.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class ObjectSeededViewOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'objectMetadata',
    name: 'objectSeededViewOnCreate',
    description:
      'When an object is created through an incremental build, seed one regular table view ("All {objectLabelPlural}") alongside the engine-owned INDEX view, so users get a view they own and can group, filter or delete freely. The view and its view fields — reserved system fields and same-batch caller fields alike — are emitted with isSystemSideEffect: false: the engine writes them once and never reconciles them, which is what makes a later user edit or deletion stick. Manifest-driven builds are skipped (detected by inferDeletionFromMissingEntities): their from/to reconciliation would infer-delete a view the manifest does not declare on the next sync, so applications declare their own views instead. In the remaining path the object belongs to the workspace-custom application, so deriving the deterministic identifier from the object\'s application converges with upgrade:2-39:seed-object-default-view, which derives it from workspace-custom explicitly — neither writer can duplicate the other\'s row. Navigation still resolves to the INDEX view client-side; pointing it at the seeded view is a separate client-side change.',
  },
) {
  buildSideEffects({
    flatEntity: sourceFlatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName,
    context,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    if (isDefined(context.buildOptions.inferDeletionFromMissingEntities)) {
      return { status: 'success', operations: {} };
    }

    const { applicationUniversalIdentifier } = sourceFlatObjectMetadata;

    const flatSeededViewToCreate = computeSeededObjectViewToCreate({
      objectMetadata: sourceFlatObjectMetadata,
      applicationUniversalIdentifier,
    });

    const flatViewFieldsToCreate = computeSeededObjectViewFieldsToCreate({
      sourceFlatObjectMetadata,
      seededViewUniversalIdentifier: flatSeededViewToCreate.universalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
    });

    return {
      status: 'success',
      operations: {
        view: {
          flatEntityToCreate: {
            [flatSeededViewToCreate.universalIdentifier]:
              flatSeededViewToCreate,
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
