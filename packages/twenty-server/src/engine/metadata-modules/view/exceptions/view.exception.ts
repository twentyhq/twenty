import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export class ViewException extends CustomException<ViewExceptionCode> {
  constructor(
    message: string,
    code: ViewExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage: userFriendlyMessage ?? msg`A view error occurred.`,
    });
  }
}

export enum ViewExceptionCode {
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
  INVALID_VIEW_DATA = 'INVALID_VIEW_DATA',
  VIEW_CREATE_PERMISSION_DENIED = 'VIEW_CREATE_PERMISSION_DENIED',
  VIEW_MODIFY_PERMISSION_DENIED = 'VIEW_MODIFY_PERMISSION_DENIED',
}

export enum ViewExceptionMessageKey {
  WORKSPACE_ID_REQUIRED = 'WORKSPACE_ID_REQUIRED',
  OBJECT_METADATA_ID_REQUIRED = 'OBJECT_METADATA_ID_REQUIRED',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
  INVALID_VIEW_DATA = 'INVALID_VIEW_DATA',
  VIEW_CREATE_PERMISSION_DENIED = 'VIEW_CREATE_PERMISSION_DENIED',
  VIEW_MODIFY_PERMISSION_DENIED = 'VIEW_MODIFY_PERMISSION_DENIED',
}

export const generateViewExceptionMessage = (
  key: ViewExceptionMessageKey,
  id?: string,
) => {
  switch (key) {
    case ViewExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return 'WorkspaceId is required';
    case ViewExceptionMessageKey.OBJECT_METADATA_ID_REQUIRED:
      return 'ObjectMetadataId is required';
    case ViewExceptionMessageKey.VIEW_NOT_FOUND:
      return `View${id ? ` (id: ${id})` : ''} not found`;
    case ViewExceptionMessageKey.INVALID_VIEW_DATA:
      return `Invalid view data${id ? ` for view id: ${id}` : ''}`;
    case ViewExceptionMessageKey.VIEW_CREATE_PERMISSION_DENIED:
      return 'You do not have permission to create workspace-level views';
    case ViewExceptionMessageKey.VIEW_MODIFY_PERMISSION_DENIED:
      return 'You do not have permission to modify this view';
    default:
      assertUnreachable(key);
  }
};

export const generateViewUserFriendlyExceptionMessage = (
  key: ViewExceptionMessageKey,
): MessageDescriptor | undefined => {
  switch (key) {
    case ViewExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return msg`WorkspaceId is required to create a view.`;
    case ViewExceptionMessageKey.OBJECT_METADATA_ID_REQUIRED:
      return msg`ObjectMetadataId is required to create a view.`;
    case ViewExceptionMessageKey.VIEW_CREATE_PERMISSION_DENIED:
      return msg`You don't have permission to create workspace-level views.`;
    case ViewExceptionMessageKey.VIEW_MODIFY_PERMISSION_DENIED:
      return msg`You don't have permission to modify this view.`;
  }
};
