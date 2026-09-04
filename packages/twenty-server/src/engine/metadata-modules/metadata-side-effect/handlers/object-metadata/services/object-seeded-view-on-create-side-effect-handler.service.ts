import { Injectable } from '@nestjs/common';

import { fromArrayToUniqueKeyRecord } from 'twenty-shared/utils';

import { computeSeededObjectViewToCreate } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-seeded-object-view-to-create.util';
import { computeSystemViewFieldsForCreatedObjectView } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-system-view-fields-for-created-object-view.util';
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
      'When an object is created, seed one regular table view ("All {objectLabelPlural}") alongside the engine-owned INDEX view, so navigation lands on a view the user owns and can group, filter or delete freely. Both the view and its view fields are emitted with isSystemSideEffect: false: the engine writes them once at object creation and never reconciles them again, which is what makes a later user edit or deletion stick. The identifier is deterministic (object identifier + seeded view key), so the create handler and the backfill command converge on the same row and neither can produce a duplicate. Its view fields mirror the INDEX view layout at creation time and then diverge: nothing appends a view field when a field is created later, by the same ownership rule.',
  },
) {
  buildSideEffects({
    flatEntity: sourceFlatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const { applicationUniversalIdentifier } = sourceFlatObjectMetadata;

    const flatSeededViewToCreate = computeSeededObjectViewToCreate({
      objectMetadata: sourceFlatObjectMetadata,
      applicationUniversalIdentifier,
    });

    const flatViewFieldsToCreate = computeSystemViewFieldsForCreatedObjectView({
      sourceFlatObjectMetadata,
      viewUniversalIdentifier: flatSeededViewToCreate.universalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
      labelIdentifierPolicy: 'displayedFirst',
    }).map((flatViewField) => ({
      ...flatViewField,
      isSystemSideEffect: false,
    }));

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
