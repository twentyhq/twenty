import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export class ViewFieldException extends CustomException<ViewFieldExceptionCode> {
  constructor(
    message: string,
    code: ViewFieldExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`A view field error occurred.`,
    });
  }
}

export enum ViewFieldExceptionCode {
  VIEW_FIELD_NOT_FOUND = 'VIEW_FIELD_NOT_FOUND',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
  INVALID_VIEW_FIELD_DATA = 'INVALID_VIEW_FIELD_DATA',
}

export enum ViewFieldExceptionMessageKey {
  WORKSPACE_ID_REQUIRED = 'WORKSPACE_ID_REQUIRED',
  VIEW_ID_REQUIRED = 'VIEW_ID_REQUIRED',
  VIEW_FIELD_NOT_FOUND = 'VIEW_FIELD_NOT_FOUND',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
  INVALID_VIEW_FIELD_DATA = 'INVALID_VIEW_FIELD_DATA',
  FIELD_METADATA_ID_REQUIRED = 'FIELD_METADATA_ID_REQUIRED',
  VIEW_FIELD_ALREADY_EXISTS = 'VIEW_FIELD_ALREADY_EXISTS',
}

export const generateViewFieldExceptionMessage = (
  key: ViewFieldExceptionMessageKey,
  id?: string,
) => {
  switch (key) {
    case ViewFieldExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return 'WorkspaceId is required';
    case ViewFieldExceptionMessageKey.VIEW_ID_REQUIRED:
      return 'ViewId is required';
    case ViewFieldExceptionMessageKey.VIEW_FIELD_NOT_FOUND:
      return `View field${id ? ` (id: ${id})` : ''} not found`;
    case ViewFieldExceptionMessageKey.VIEW_NOT_FOUND:
      return `View${id ? ` (id: ${id})` : ''} not found`;
    case ViewFieldExceptionMessageKey.INVALID_VIEW_FIELD_DATA:
      return `Invalid view field data${id ? ` for view field id: ${id}` : ''}`;
    case ViewFieldExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      return 'FieldMetadataId is required';
    case ViewFieldExceptionMessageKey.VIEW_FIELD_ALREADY_EXISTS:
      return 'View field already exists';
    default:
      assertUnreachable(key);
  }
};

export const generateViewFieldUserFriendlyExceptionMessage = (
  key: ViewFieldExceptionMessageKey,
): MessageDescriptor | undefined => {
  switch (key) {
    case ViewFieldExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return msg`WorkspaceId is required to create a view field.`;
    case ViewFieldExceptionMessageKey.VIEW_ID_REQUIRED:
      return msg`ViewId is required to create a view field.`;
    case ViewFieldExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      return msg`FieldMetadataId is required to create a view field.`;
    case ViewFieldExceptionMessageKey.VIEW_FIELD_ALREADY_EXISTS:
      return msg`View field already exists.`;
  }
};
