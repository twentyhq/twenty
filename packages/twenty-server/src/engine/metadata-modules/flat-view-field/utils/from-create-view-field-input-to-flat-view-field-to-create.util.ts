import { msg } from '@lingui/core/macro';
import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type ViewFieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-view-field/types/view-field-input-transpilation-result.type';
import { type CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';
import { ViewFieldExceptionCode } from 'src/engine/metadata-modules/view-field/exceptions/view-field.exception';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/constants/DEFAULT_VIEW_FIELD_SIZE';

export type FromCreateViewFieldInputToFlatViewFieldToCreateArgs = {
  createViewFieldInput: CreateViewFieldInput;
  workspaceId: string;
} & Pick<AllFlatEntityMaps, 'flatViewMaps' | 'flatFieldMetadataMaps'>;

export const fromCreateViewFieldInputToFlatViewFieldToCreate = ({
  createViewFieldInput: rawCreateViewFieldInput,
  workspaceId,
  flatViewMaps,
  flatFieldMetadataMaps,
}: FromCreateViewFieldInputToFlatViewFieldToCreateArgs): ViewFieldInputTranspilationResult<FlatViewField> => {
  const { fieldMetadataId, viewId, ...createViewFieldInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewFieldInput,
      ['aggregateOperation', 'fieldMetadataId', 'id', 'viewId'],
    );

  // Validate that the view exists
  const view = flatViewMaps.byId[viewId];

  if (!isDefined(view)) {
    return {
      status: 'fail',
      error: {
        code: ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
        message: 'Provided view id does not exist',
        userFriendlyMessage: msg`View not found for this view field`,
      },
    };
  }

  // Validate that the field metadata exists
  const fieldMetadata = flatFieldMetadataMaps.byId[fieldMetadataId];

  if (!isDefined(fieldMetadata)) {
    return {
      status: 'fail',
      error: {
        code: ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
        message: 'Provided field metadata id does not exist',
        userFriendlyMessage: msg`Field metadata not found for this view field`,
      },
    };
  }

  // Validate that the field metadata belongs to the same object as the view
  if (fieldMetadata.objectMetadataId !== view.objectMetadataId) {
    return {
      status: 'fail',
      error: {
        code: ViewFieldExceptionCode.INVALID_VIEW_FIELD_DATA,
        message: 'Field metadata does not belong to the same object as the view',
        userFriendlyMessage: msg`Field and view must belong to the same object`,
      },
    };
  }

  const createdAt = new Date();
  const viewFieldId = createViewFieldInput.id ?? v4();

  return {
    status: 'success',
    result: {
      id: viewFieldId,
      fieldMetadataId,
      viewId,
      workspaceId,
      createdAt: createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      universalIdentifier:
        createViewFieldInput.universalIdentifier ?? viewFieldId,
      isVisible: createViewFieldInput.isVisible ?? true,
      size: createViewFieldInput.size ?? DEFAULT_VIEW_FIELD_SIZE,
      position: createViewFieldInput.position ?? 0,
      aggregateOperation: createViewFieldInput.aggregateOperation ?? null,
      applicationId: createViewFieldInput.applicationId ?? null,
    },
  };
};
