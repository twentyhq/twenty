import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export class ViewSortException extends CustomException<ViewSortExceptionCode> {
  constructor(
    message: string,
    code: ViewSortExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`A view sort error occurred.`,
      category: VIEW_SORT_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}

export enum ViewSortExceptionCode {
  VIEW_SORT_NOT_FOUND = 'VIEW_SORT_NOT_FOUND',
  INVALID_VIEW_SORT_DATA = 'INVALID_VIEW_SORT_DATA',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
}
const VIEW_SORT_EXCEPTION_CATEGORY_BY_CODE = {
  [ViewSortExceptionCode.VIEW_SORT_NOT_FOUND]: 'NOT_FOUND',
  [ViewSortExceptionCode.INVALID_VIEW_SORT_DATA]: 'BAD_USER_INPUT',
  [ViewSortExceptionCode.VIEW_NOT_FOUND]: 'NOT_FOUND',
} as const satisfies Record<ViewSortExceptionCode, ExceptionCategory>;

export enum ViewSortExceptionMessageKey {
  WORKSPACE_ID_REQUIRED = 'WORKSPACE_ID_REQUIRED',
  VIEW_ID_REQUIRED = 'VIEW_ID_REQUIRED',
  VIEW_SORT_NOT_FOUND = 'VIEW_SORT_NOT_FOUND',
  INVALID_VIEW_SORT_DATA = 'INVALID_VIEW_SORT_DATA',
  FIELD_METADATA_ID_REQUIRED = 'FIELD_METADATA_ID_REQUIRED',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
}

export const generateViewSortExceptionMessage = (
  key: ViewSortExceptionMessageKey,
  id?: string,
) => {
  switch (key) {
    case ViewSortExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return 'WorkspaceId is required';
    case ViewSortExceptionMessageKey.VIEW_ID_REQUIRED:
      return 'ViewId is required';
    case ViewSortExceptionMessageKey.VIEW_SORT_NOT_FOUND:
      return `View sort${id ? ` (id: ${id})` : ''} not found`;
    case ViewSortExceptionMessageKey.INVALID_VIEW_SORT_DATA:
      return `Invalid view sort data${id ? ` for view sort id: ${id}` : ''}`;
    case ViewSortExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      return 'FieldMetadataId is required';
    case ViewSortExceptionMessageKey.VIEW_NOT_FOUND:
      return `View${id ? ` (id: ${id})` : ''} not found`;
    default:
      assertUnreachable(key);
  }
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
  }
};
