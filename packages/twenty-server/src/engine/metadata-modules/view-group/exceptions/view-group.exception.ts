import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export class ViewGroupException extends CustomException<ViewGroupExceptionCode> {
  constructor(
    message: string,
    code: ViewGroupExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`A view group error occurred.`,
    });
  }
}

export enum ViewGroupExceptionCode {
  VIEW_GROUP_NOT_FOUND = 'VIEW_GROUP_NOT_FOUND',
  INVALID_VIEW_GROUP_DATA = 'INVALID_VIEW_GROUP_DATA',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
  MISSING_MAIN_GROUP_BY_FIELD_METADATA_ID = 'MISSING_MAIN_GROUP_BY_FIELD_METADATA_ID',
}

export enum ViewGroupExceptionMessageKey {
  WORKSPACE_ID_REQUIRED = 'WORKSPACE_ID_REQUIRED',
  VIEW_ID_REQUIRED = 'VIEW_ID_REQUIRED',
  VIEW_GROUP_NOT_FOUND = 'VIEW_GROUP_NOT_FOUND',
  INVALID_VIEW_GROUP_DATA = 'INVALID_VIEW_GROUP_DATA',
  FIELD_METADATA_ID_REQUIRED = 'FIELD_METADATA_ID_REQUIRED',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
}

export const generateViewGroupExceptionMessage = (
  key: ViewGroupExceptionMessageKey,
  id?: string,
) => {
  switch (key) {
    case ViewGroupExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return 'WorkspaceId is required';
    case ViewGroupExceptionMessageKey.VIEW_ID_REQUIRED:
      return 'ViewId is required';
    case ViewGroupExceptionMessageKey.VIEW_GROUP_NOT_FOUND:
      return `View group${id ? ` (id: ${id})` : ''} not found`;
    case ViewGroupExceptionMessageKey.INVALID_VIEW_GROUP_DATA:
      return `Invalid view group data${id ? ` for view group id: ${id}` : ''}`;
    case ViewGroupExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      return 'FieldMetadataId is required';
    case ViewGroupExceptionMessageKey.VIEW_NOT_FOUND:
      return `View${id ? ` (id: ${id})` : ''} not found`;
    default:
      assertUnreachable(key);
  }
};

export const generateViewGroupUserFriendlyExceptionMessage = (
  key: ViewGroupExceptionMessageKey,
): MessageDescriptor | undefined => {
  switch (key) {
    case ViewGroupExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return msg`WorkspaceId is required to create a view group.`;
    case ViewGroupExceptionMessageKey.VIEW_ID_REQUIRED:
      return msg`ViewId is required to create a view group.`;
    case ViewGroupExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      return msg`FieldMetadataId is required to create a view group.`;
  }
};
