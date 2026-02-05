import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { DEFAULT_VIEW_FIELD_SIZE } from 'src/engine/metadata-modules/flat-view-field/constants/default-view-field-size.constant';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type CreateViewFieldInput } from 'src/engine/metadata-modules/view-field/dtos/inputs/create-view-field.input';

export type FromCreateViewFieldInputToFlatViewFieldToCreateArgs = {
  createViewFieldInput: CreateViewFieldInput;
  workspaceId: string;
  flatApplication: FlatApplication;
};

export const fromCreateViewFieldInputToFlatViewFieldToCreate = ({
  createViewFieldInput: rawCreateViewFieldInput,
  workspaceId,
  flatApplication,
}: FromCreateViewFieldInputToFlatViewFieldToCreateArgs): FlatViewField => {
  const { fieldMetadataId, viewId, ...createViewFieldInput } =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreateViewFieldInput,
      ['aggregateOperation', 'fieldMetadataId', 'id', 'viewId'],
    );

  const createdAt = new Date().toISOString();
  const viewFieldId = createViewFieldInput.id ?? v4();

  return {
    id: viewFieldId,
    fieldMetadataId,
    viewId,
    workspaceId,
    createdAt: createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: createViewFieldInput.universalIdentifier ?? v4(),
    isVisible: createViewFieldInput.isVisible ?? true,
    size: createViewFieldInput.size ?? DEFAULT_VIEW_FIELD_SIZE,
    position: createViewFieldInput.position ?? 0,
    aggregateOperation: createViewFieldInput.aggregateOperation ?? null,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
  };
};
