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
      'When an object is created under the workspace-custom application, seed one regular table view ("All {objectLabelPlural}") alongside the engine-owned INDEX view, so users get a view they own and can group, filter or delete freely. The view and its view fields — reserved system fields and same-batch caller fields alike — are emitted with isSystemSideEffect: false: the engine writes them once and never reconciles them, which is what makes a later user edit or deletion stick. The guard is the workspaceCustomApplicationUniversalIdentifier that the object-create path declares in its build options: manifest-driven builds never declare it, so application syncs stay pure projections of their manifest and their from/to reconciliation cannot infer-delete a seeded view on the next sync. In the seeding path the object belongs to the workspace-custom application, so deriving the deterministic identifier from the object\'s application converges with upgrade:2-40:seed-object-default-view, which derives it from workspace-custom explicitly — neither writer can duplicate the other\'s row. Navigation still resolves to the INDEX view client-side; pointing it at the seeded view is a separate client-side change.',
  },
) {
  buildSideEffects({
    flatEntity: sourceFlatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName,
    context,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const { applicationUniversalIdentifier } = sourceFlatObjectMetadata;

    if (
      !isDefined(
        context.buildOptions.workspaceCustomApplicationUniversalIdentifier,
      ) ||
      applicationUniversalIdentifier !==
        context.buildOptions.workspaceCustomApplicationUniversalIdentifier
    ) {
      return { status: 'success', operations: {} };
    }

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
