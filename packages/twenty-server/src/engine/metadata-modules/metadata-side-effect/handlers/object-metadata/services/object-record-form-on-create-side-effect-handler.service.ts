import { Injectable } from '@nestjs/common';

import { computeSystemRecordFormPageLayoutToCreate } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-system-record-form-page-layout-to-create.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class ObjectRecordFormOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'objectMetadata',
    name: 'objectRecordFormOnCreate',
    description:
      'When an object is created, provision the shell of its RECORD_FORM page layout: the layout itself and its single "Fields" tab, both empty of widgets. Unlike RECORD_PAGE there is no view underneath: one creatable field is one FORM_FIELD widget, so every widget is owned by fieldRecordFormWidgetOnCreate, whether the field is created in the same batch as the object or later. That single ownership is what keeps the two paths from emitting the same deterministic widget identifier twice. Both entities are isSystemSideEffect with name-free deterministic universal identifiers, so an object rename keeps every identifier.',
  },
) {
  buildSideEffects({
    flatEntity: sourceFlatObjectMetadata,
  }: BuildSideEffectsArgs<'objectMetadata'>): MetadataSideEffectResult {
    const { pageLayout, pageLayoutTab } =
      computeSystemRecordFormPageLayoutToCreate({
        objectMetadata: sourceFlatObjectMetadata,
        applicationUniversalIdentifier:
          sourceFlatObjectMetadata.applicationUniversalIdentifier,
      });

    return {
      status: 'success',
      operations: {
        pageLayout: {
          flatEntityToCreate: {
            [pageLayout.universalIdentifier]: pageLayout,
          },
        },
        pageLayoutTab: {
          flatEntityToCreate: {
            [pageLayoutTab.universalIdentifier]: pageLayoutTab,
          },
        },
      },
    };
  }
}
