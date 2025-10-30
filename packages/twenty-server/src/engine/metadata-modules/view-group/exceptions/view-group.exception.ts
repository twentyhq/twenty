import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export class ViewGroupException extends CustomException {
  declare code: ViewGroupExceptionCode;
  constructor(
    message: string,
    code: ViewGroupExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, { userFriendlyMessage });
  }
}

export enum ViewGroupExceptionCode {
  VIEW_GROUP_NOT_FOUND = 'VIEW_GROUP_NOT_FOUND',
  INVALID_VIEW_GROUP_DATA = 'INVALID_VIEW_GROUP_DATA',
}

export enum ViewGroupExceptionMessageKey {
  WORKSPACE_ID_REQUIRED = 'WORKSPACE_ID_REQUIRED',
  VIEW_ID_REQUIRED = 'VIEW_ID_REQUIRED',
  VIEW_GROUP_NOT_FOUND = 'VIEW_GROUP_NOT_FOUND',
  INVALID_VIEW_GROUP_DATA = 'INVALID_VIEW_GROUP_DATA',
  FIELD_METADATA_ID_REQUIRED = 'FIELD_METADATA_ID_REQUIRED',
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
    default:
      return 'unknown';
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
    default: {
      return msg`unknown`;
    }
  }
};
