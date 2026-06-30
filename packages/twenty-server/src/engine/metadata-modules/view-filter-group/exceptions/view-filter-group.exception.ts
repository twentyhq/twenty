import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export class ViewFilterGroupException extends CustomException<ViewFilterGroupExceptionCode> {
  constructor(
    message: string,
    code: ViewFilterGroupExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`A view filter group error occurred.`,
    });
  }
}

export enum ViewFilterGroupExceptionCode {
  VIEW_FILTER_GROUP_NOT_FOUND = 'VIEW_FILTER_GROUP_NOT_FOUND',
  INVALID_VIEW_FILTER_GROUP_DATA = 'INVALID_VIEW_FILTER_GROUP_DATA',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
  CIRCULAR_DEPENDENCY = 'CIRCULAR_DEPENDENCY',
  MAX_DEPTH_EXCEEDED = 'MAX_DEPTH_EXCEEDED',
}

export enum ViewFilterGroupExceptionMessageKey {
  WORKSPACE_ID_REQUIRED = 'WORKSPACE_ID_REQUIRED',
  VIEW_ID_REQUIRED = 'VIEW_ID_REQUIRED',
  VIEW_FILTER_GROUP_NOT_FOUND = 'VIEW_FILTER_GROUP_NOT_FOUND',
  INVALID_VIEW_FILTER_GROUP_DATA = 'INVALID_VIEW_FILTER_GROUP_DATA',
  FIELD_METADATA_ID_REQUIRED = 'FIELD_METADATA_ID_REQUIRED',
  VIEW_NOT_FOUND = 'VIEW_NOT_FOUND',
}

export const generateViewFilterGroupExceptionMessage = (
  key: ViewFilterGroupExceptionMessageKey,
  id?: string,
) => {
  switch (key) {
    case ViewFilterGroupExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return 'WorkspaceId is required';
    case ViewFilterGroupExceptionMessageKey.VIEW_ID_REQUIRED:
      return 'ViewId is required';
    case ViewFilterGroupExceptionMessageKey.VIEW_FILTER_GROUP_NOT_FOUND:
      return `View filter group${id ? ` (id: ${id})` : ''} not found`;
    case ViewFilterGroupExceptionMessageKey.INVALID_VIEW_FILTER_GROUP_DATA:
      return `Invalid view filter group data${id ? ` for view filter group id: ${id}` : ''}`;
    case ViewFilterGroupExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      return 'FieldMetadataId is required';
    case ViewFilterGroupExceptionMessageKey.VIEW_NOT_FOUND:
      return `View${id ? ` (id: ${id})` : ''} not found`;
    default:
      assertUnreachable(key);
  }
};

export const generateViewFilterGroupUserFriendlyExceptionMessage = (
  key: ViewFilterGroupExceptionMessageKey,
): MessageDescriptor | undefined => {
  switch (key) {
    case ViewFilterGroupExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return msg`WorkspaceId is required to create a view filter group.`;
    case ViewFilterGroupExceptionMessageKey.VIEW_ID_REQUIRED:
      return msg`ViewId is required to create a view filter group.`;
    case ViewFilterGroupExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      return msg`FieldMetadataId is required to create a view filter group.`;
  }
};
