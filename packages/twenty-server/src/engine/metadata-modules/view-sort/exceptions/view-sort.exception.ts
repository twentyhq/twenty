import { type MessageDescriptor } from '@lingui/core';
import { msg, t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export class ViewSortException extends CustomException {
  declare code: ViewSortExceptionCode;
  constructor(
    message: string,
    code: ViewSortExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, { userFriendlyMessage });
  }
}

export enum ViewSortExceptionCode {
  VIEW_SORT_NOT_FOUND = 'VIEW_SORT_NOT_FOUND',
  INVALID_VIEW_SORT_DATA = 'INVALID_VIEW_SORT_DATA',
  VIEW_SORT_UPDATE_PERMISSION_DENIED = 'VIEW_SORT_UPDATE_PERMISSION_DENIED',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
}

export enum ViewSortExceptionMessageKey {
  WORKSPACE_ID_REQUIRED = 'WORKSPACE_ID_REQUIRED',
  VIEW_ID_REQUIRED = 'VIEW_ID_REQUIRED',
  VIEW_SORT_NOT_FOUND = 'VIEW_SORT_NOT_FOUND',
  INVALID_VIEW_SORT_DATA = 'INVALID_VIEW_SORT_DATA',
  FIELD_METADATA_ID_REQUIRED = 'FIELD_METADATA_ID_REQUIRED',
  VIEW_SORT_UPDATE_PERMISSION_DENIED = 'VIEW_SORT_UPDATE_PERMISSION_DENIED',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
}

export const generateViewSortExceptionMessage = (
  key: ViewSortExceptionMessageKey,
  id?: string,
) => {
  let message = '';

  switch (key) {
    case ViewSortExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      message = t`WorkspaceId is required`;
      break;
    case ViewSortExceptionMessageKey.VIEW_ID_REQUIRED:
      message = t`ViewId is required`;
      break;
    case ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND:
      message = id
        ? t`View sort (id: ${id}) not found`
        : t`View sort not found`;
      break;
    case ViewSortExceptionMessageKey.INVALID_VIEW_SORT_DATA:
      message = id
        ? t`Invalid view sort data for view sort id: ${id}`
        : t`Invalid view sort data`;
      break;
    case ViewSortExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      message = t`FieldMetadataId is required`;
      break;
    case ViewSortExceptionMessageKey.VIEW_SORT_UPDATE_PERMISSION_DENIED:
      message = t`You do not have permission to update this view`;
      break;
    case ViewSortExceptionMessageKey.VIEW_NOT_FOUND:
      message = id ? t`View (id: ${id}) not found` : t`View not found`;
      break;
    default:
      assertUnreachable(key);
  }

  return message;
};

export const generateViewSortUserFriendlyExceptionMessage = (
  key: ViewSortExceptionMessageKey,
): MessageDescriptor | undefined => {
  switch (key) {
    case ViewSortExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return msg`WorkspaceId is required to create a view sort.`;
    case ViewSortExceptionMessageKey.VIEW_ID_REQUIRED:
      return msg`ViewId is required to create a view sort.`;
    case ViewSortExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      return msg`FieldMetadataId is required to create a view sort.`;
    case ViewSortExceptionMessageKey.VIEW_SORT_UPDATE_PERMISSION_DENIED:
      return msg`You don't have permission to update this view.`;
  }
};
