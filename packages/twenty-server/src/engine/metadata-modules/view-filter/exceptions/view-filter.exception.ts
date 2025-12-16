import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export class ViewFilterException extends CustomException<ViewFilterExceptionCode> {
  constructor(
    message: string,
    code: ViewFilterExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`A view filter error occurred.`,
    });
  }
}

export enum ViewFilterExceptionCode {
  VIEW_FILTER_NOT_FOUND = 'VIEW_FILTER_NOT_FOUND',
  INVALID_VIEW_FILTER_DATA = 'INVALID_VIEW_FILTER_DATA',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
}

export enum ViewFilterExceptionMessageKey {
  WORKSPACE_ID_REQUIRED = 'WORKSPACE_ID_REQUIRED',
  VIEW_ID_REQUIRED = 'VIEW_ID_REQUIRED',
  VIEW_FILTER_NOT_FOUND = 'VIEW_FILTER_NOT_FOUND',
  INVALID_VIEW_FILTER_DATA = 'INVALID_VIEW_FILTER_DATA',
  FIELD_METADATA_ID_REQUIRED = 'FIELD_METADATA_ID_REQUIRED',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
}

export const generateViewFilterExceptionMessage = (
  key: ViewFilterExceptionMessageKey,
  id?: string,
) => {
  switch (key) {
    case ViewFilterExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return 'WorkspaceId is required';
    case ViewFilterExceptionMessageKey.VIEW_ID_REQUIRED:
      return 'ViewId is required';
    case ViewFilterExceptionMessageKey.VIEW_FILTER_NOT_FOUND:
      return `View filter${id ? ` (id: ${id})` : ''} not found`;
    case ViewFilterExceptionMessageKey.INVALID_VIEW_FILTER_DATA:
      return `Invalid view filter data${id ? ` for view filter id: ${id}` : ''}`;
    case ViewFilterExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      return 'FieldMetadataId is required';
    case ViewFilterExceptionMessageKey.VIEW_NOT_FOUND:
      return `View${id ? ` (id: ${id})` : ''} not found`;
    default:
      assertUnreachable(key);
  }
};

export const generateViewFilterUserFriendlyExceptionMessage = (
  key: ViewFilterExceptionMessageKey,
): MessageDescriptor | undefined => {
  switch (key) {
    case ViewFilterExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return msg`WorkspaceId is required to create a view filter.`;
    case ViewFilterExceptionMessageKey.VIEW_ID_REQUIRED:
      return msg`ViewId is required to create a view filter.`;
    case ViewFilterExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      return msg`FieldMetadataId is required to create a view filter.`;
  }
};
