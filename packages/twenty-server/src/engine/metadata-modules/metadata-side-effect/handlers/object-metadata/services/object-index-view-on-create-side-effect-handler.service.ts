import { Injectable } from '@nestjs/common';

import { ViewKey } from 'twenty-shared/types';
import { fromArrayToUniqueKeyRecord } from 'twenty-shared/utils';

import { computeSystemViewFieldsForCreatedObjectView } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-system-view-fields-for-created-object-view.util';
import { computeSystemViewToCreate } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-system-view-to-create.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

@Injectable()
export class ObjectIndexViewOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'objectMetadata',
    name: 'objectIndexViewOnCreate',
    description:
      'When an object is created, provision its default INDEX table view ("All {objectLabelPlural}") with one view field per displayable SYSTEM field only, all isSystemSideEffect so the engine owns their lifecycle. The reserved system fields themselves are created by objectSystemFieldsOnCreate; this handler re-derives them statelessly from the object identity, so there is no ordering dependency between the two. View fields for caller-provided fields are owned by fieldSystemViewFieldsOnCreate (the field creation side effect), which positions them before the system view fields; both handlers derive positions from the same caller-input list so the layout is contiguous without any ordering dependency. The view identifier is name-free (object identifier + INDEX view key), so an object rename keeps the same view. The engine is the sole owner of the INDEX view and always emits it: the flat view validator rejects caller-created INDEX views (caller inputs are forced isSystemSideEffect: false) and enforces a single non-deleted INDEX view per object. twenty-standard is not concerned: it synchronizes through the from/to migration path, which never runs the side-effect engine, and authors its own curated INDEX view/fields.',
  },
) {
  buildSideEffects({
    flatEntity: flatObjectMetadata,
    allFlatEntityOperationRecordByMetadataName,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const sourceFlatObjectMetadata =
      flatObjectMetadata as UniversalFlatObjectMetadata;
    const { applicationUniversalIdentifier } = sourceFlatObjectMetadata;

    const flatIndexViewToCreate = computeSystemViewToCreate({
      objectMetadata: sourceFlatObjectMetadata,
      applicationUniversalIdentifier,
      viewKey: ViewKey.INDEX,
    });

    const flatViewFieldsToCreate = computeSystemViewFieldsForCreatedObjectView({
      sourceFlatObjectMetadata,
      viewUniversalIdentifier: flatIndexViewToCreate.universalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
      labelIdentifierPolicy: 'displayedFirst',
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
