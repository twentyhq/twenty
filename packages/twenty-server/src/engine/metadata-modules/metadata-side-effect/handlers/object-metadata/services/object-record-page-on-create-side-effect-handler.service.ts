import { Injectable } from '@nestjs/common';

import { fromArrayToUniqueKeyRecord } from 'twenty-shared/utils';

import { computeCallerFlatFieldMetadatasForObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-caller-flat-field-metadatas-for-object.util';
import { computeDefaultRecordPageViewFieldPositionByFieldUniversalIdentifier } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-default-record-page-view-field-position-by-field-universal-identifier.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { buildReservedSystemFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-reserved-system-flat-field-metadatas-for-custom-object.util';
import { computeFlatDefaultRecordPageLayoutToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-default-record-page-layout-to-create.util';
import { computeFlatRecordPageFieldsViewToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-record-page-fields-view-to-create.util';
import { computeFlatViewFieldsToCreate } from 'src/engine/metadata-modules/object-metadata/utils/compute-flat-view-fields-to-create.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

@Injectable()
export class ObjectRecordPageOnCreateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'create',
    metadataName: 'objectMetadata',
    name: 'objectRecordPageOnCreate',
    description:
      'When an object is created, provision its default record-page stack: the FIELDS_WIDGET record-page view ("{labelSingular} Record Page Fields", keyed on ViewKey.FIELDS_WIDGET) with one view field per displayable SYSTEM field (the label identifier is excluded: the record page displays it in the title), and the RECORD_PAGE page layout with its 5 tabs (Home/Timeline/Tasks/Notes/Files) and 5 widgets, of which the Home FIELDS widget references the record-page view by universal identifier. All entities are isSystemSideEffect with name-free deterministic universal identifiers, so an object rename keeps every identifier. View fields for caller-provided fields are owned by fieldSystemViewFieldsOnCreate; both handlers derive positions from the same caller-input list so the layout is contiguous without ordering dependency. The engine always emits the system record-page stack, exactly like INDEX. Caller-defined custom RECORD_PAGE layouts (e.g. manifest apps authoring a record page for their own objects) are legitimate and coexist with it: the frontend displays a custom record page over the system one when defined, and identifier squatting on engine emissions is caught by the side-effect collision detector. twenty-standard is not concerned: it synchronizes through the from/to migration path, which never runs the side-effect engine, and authors its own curated record-page stack on the same derived identifiers.',
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

    const flatRecordPageViewToCreate = computeFlatRecordPageFieldsViewToCreate({
      objectMetadata: sourceFlatObjectMetadata,
      applicationUniversalIdentifier,
    });

    const systemFlatFieldMetadatas = Object.values(
      buildReservedSystemFlatFieldMetadatasForCustomObject({
        flatObjectMetadata: {
          applicationUniversalIdentifier,
          universalIdentifier,
        },
      }),
    );

    const callerFlatFieldMetadatas = computeCallerFlatFieldMetadatasForObject({
      objectMetadataUniversalIdentifier: universalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier:
        sourceFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
      allFlatEntityOperationRecordByMetadataName,
    });

    const positionByFieldUniversalIdentifier =
      computeDefaultRecordPageViewFieldPositionByFieldUniversalIdentifier({
        applicationUniversalIdentifier,
        objectMetadataUniversalIdentifier: universalIdentifier,
        labelIdentifierFieldMetadataUniversalIdentifier:
          sourceFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
        callerFlatFieldMetadatas,
      });

    const flatViewFieldsToCreate = computeFlatViewFieldsToCreate({
      objectFlatFieldMetadatas: systemFlatFieldMetadatas,
      viewUniversalIdentifier: flatRecordPageViewToCreate.universalIdentifier,
      applicationUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier:
        sourceFlatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
      excludeLabelIdentifier: true,
    }).map((flatViewFieldToCreate) => ({
      ...flatViewFieldToCreate,
      position:
        positionByFieldUniversalIdentifier.get(
          flatViewFieldToCreate.fieldMetadataUniversalIdentifier,
        ) ?? flatViewFieldToCreate.position,
    }));

    const { pageLayouts, pageLayoutTabs, pageLayoutWidgets } =
      computeFlatDefaultRecordPageLayoutToCreate({
        objectMetadata: sourceFlatObjectMetadata,
        applicationUniversalIdentifier,
        recordPageFieldsViewUniversalIdentifier:
          flatRecordPageViewToCreate.universalIdentifier,
      });

    return {
      status: 'success',
      operations: {
        view: {
          flatEntityToCreate: {
            [flatRecordPageViewToCreate.universalIdentifier]:
              flatRecordPageViewToCreate,
          },
        },
        viewField: {
          flatEntityToCreate: fromArrayToUniqueKeyRecord({
            array: flatViewFieldsToCreate,
            uniqueKey: 'universalIdentifier',
          }),
        },
        pageLayout: {
          flatEntityToCreate: fromArrayToUniqueKeyRecord({
            array: pageLayouts,
            uniqueKey: 'universalIdentifier',
          }),
        },
        pageLayoutTab: {
          flatEntityToCreate: fromArrayToUniqueKeyRecord({
            array: pageLayoutTabs,
            uniqueKey: 'universalIdentifier',
          }),
        },
        pageLayoutWidget: {
          flatEntityToCreate: fromArrayToUniqueKeyRecord({
            array: pageLayoutWidgets,
            uniqueKey: 'universalIdentifier',
          }),
        },
      },
    };
  }
}
