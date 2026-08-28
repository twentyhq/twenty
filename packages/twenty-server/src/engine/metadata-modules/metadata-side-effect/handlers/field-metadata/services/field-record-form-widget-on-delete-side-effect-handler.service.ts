import { Injectable } from '@nestjs/common';

import {
  getSystemFormFieldPageLayoutWidgetUniversalIdentifier,
  getSystemPageLayoutTabUniversalIdentifier,
  getSystemRecordFormPageLayoutUniversalIdentifier,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { RECORD_FORM_TAB_PROPS } from 'src/engine/metadata-modules/metadata-side-effect/constants/record-form-tab-props.constant';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

@Injectable()
export class FieldRecordFormWidgetOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'fieldMetadata',
    name: 'fieldRecordFormWidgetOnDelete',
    description:
      'When a field is deleted, cascade-delete the engine-owned FORM_FIELD widget displaying it, counterpart of fieldRecordFormWidgetOnCreate. A widget references its field through its configuration jsonb, not a foreign key, so nothing else would ever remove it: neither the database cascade nor manifest deletion inference, which excludes isSystemSideEffect entities. The widget is resolved by its derived universal identifier rather than by scanning, and caller-authored widgets displaying the same field are NOT touched: they are deleted through normal deletion inference.',
  },
) {
  buildSideEffects({
    flatEntity: flatFieldMetadata,
    relatedFlatEntityMaps,
  }: BuildSideEffectsArgs<'fieldMetadata'>): MetadataSideEffectResult {
    const sourceFlatFieldMetadata =
      flatFieldMetadata as UniversalFlatFieldMetadata;
    const {
      applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier,
    } = sourceFlatFieldMetadata;

    const recordFormPageLayoutTabUniversalIdentifier =
      getSystemPageLayoutTabUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          applicationUniversalIdentifier,
        pageLayoutUniversalIdentifier:
          getSystemRecordFormPageLayoutUniversalIdentifier({
            objectMetadataApplicationUniversalIdentifier:
              applicationUniversalIdentifier,
            objectUniversalIdentifier: objectMetadataUniversalIdentifier,
          }),
        title: RECORD_FORM_TAB_PROPS.title,
      });

    const flatPageLayoutWidgetToDelete =
      relatedFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
        getSystemFormFieldPageLayoutWidgetUniversalIdentifier({
          fieldMetadataApplicationUniversalIdentifier:
            applicationUniversalIdentifier,
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
