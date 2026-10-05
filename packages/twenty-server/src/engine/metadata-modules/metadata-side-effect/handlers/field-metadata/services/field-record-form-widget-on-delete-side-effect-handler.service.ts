import { Injectable } from '@nestjs/common';

import { getSystemFormFieldPageLayoutWidgetUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { getRecordFormPageLayoutTabUniversalIdentifier } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/get-record-form-page-layout-tab-universal-identifier.util';
import { resolveParentFlatObjectMetadataAfterStateForFieldSideEffect } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/utils/resolve-parent-flat-object-metadata-after-state-for-field-side-effect.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class FieldRecordFormWidgetOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'fieldMetadata',
    name: 'fieldRecordFormWidgetOnDelete',
    description:
      'When a field is deleted, cascade-delete the engine-owned FORM_FIELD widget displaying it, counterpart of fieldRecordFormWidgetOnCreate. A widget references its field through its configuration jsonb, not a foreign key, so nothing else would ever remove it: neither the database cascade nor manifest deletion inference, which excludes isSystemSideEffect entities. The widget is resolved by its derived universal identifier rather than by scanning, which means the layout and tab identifiers must be derived from the application owning the OBJECT, exactly as fieldRecordFormWidgetOnCreate derives them; the application owning the FIELD differs whenever an app contributes a field to a foreign object, and deriving from it would miss the widget and orphan it. Noop when the object is already gone, since the object delete cascade takes the whole stack. Caller-authored widgets displaying the same field are NOT touched: they are deleted through normal deletion inference.',
  },
) {
  buildSideEffects({
    flatEntity: sourceFlatFieldMetadata,
    allFlatEntityOperationRecordByMetadataName,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const { objectMetadataUniversalIdentifier } = sourceFlatFieldMetadata;

    const parentFlatObjectMetadata =
      resolveParentFlatObjectMetadataAfterStateForFieldSideEffect({
        objectMetadataUniversalIdentifier,
        allFlatEntityOperationRecordByMetadataName,
        relatedFlatEntityMaps,
      });

    if (!isDefined(parentFlatObjectMetadata)) {
      return { status: 'noop' };
    }

    const objectApplicationUniversalIdentifier =
      parentFlatObjectMetadata.applicationUniversalIdentifier;

    const recordFormPageLayoutTabUniversalIdentifier =
      getRecordFormPageLayoutTabUniversalIdentifier({
        objectApplicationUniversalIdentifier,
        objectMetadataUniversalIdentifier,
      });

    const flatPageLayoutWidgetToDelete =
      relatedFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
        getSystemFormFieldPageLayoutWidgetUniversalIdentifier({
          fieldMetadataApplicationUniversalIdentifier:
            sourceFlatFieldMetadata.applicationUniversalIdentifier,
          pageLayoutTabUniversalIdentifier:
            recordFormPageLayoutTabUniversalIdentifier,
          fieldMetadataUniversalIdentifier:
            sourceFlatFieldMetadata.universalIdentifier,
        })
      ];

    if (
      !isDefined(flatPageLayoutWidgetToDelete) ||
      flatPageLayoutWidgetToDelete.isSystemSideEffect !== true
    ) {
      return { status: 'noop' };
    }

    return {
      status: 'success',
      operations: {
        pageLayoutWidget: {
          flatEntityToDelete: {
            [flatPageLayoutWidgetToDelete.universalIdentifier]:
              flatPageLayoutWidgetToDelete,
          },
        },
      },
    };
  }
}
