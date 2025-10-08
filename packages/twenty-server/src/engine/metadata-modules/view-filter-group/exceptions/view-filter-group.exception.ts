import { t } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export class ViewFilterGroupException extends CustomException {
  declare code: ViewFilterGroupExceptionCode;
  constructor(
    message: string,
    code: ViewFilterGroupExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, { userFriendlyMessage });
  }
}

export enum ViewFilterGroupExceptionCode {
  VIEW_FILTER_GROUP_NOT_FOUND = 'VIEW_FILTER_GROUP_NOT_FOUND',
  INVALID_VIEW_FILTER_GROUP_DATA = 'INVALID_VIEW_FILTER_GROUP_DATA',
}

export enum ViewFilterGroupExceptionMessageKey {
  WORKSPACE_ID_REQUIRED = 'WORKSPACE_ID_REQUIRED',
  VIEW_ID_REQUIRED = 'VIEW_ID_REQUIRED',
  VIEW_FILTER_GROUP_NOT_FOUND = 'VIEW_FILTER_GROUP_NOT_FOUND',
  INVALID_VIEW_FILTER_GROUP_DATA = 'INVALID_VIEW_FILTER_GROUP_DATA',
  FIELD_METADATA_ID_REQUIRED = 'FIELD_METADATA_ID_REQUIRED',
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
    default:
      assertUnreachable(key);
  }
};

export const generateViewFilterGroupUserFriendlyExceptionMessage = (
  key: ViewFilterGroupExceptionMessageKey,
) => {
  switch (key) {
    case ViewFilterGroupExceptionMessageKey.WORKSPACE_ID_REQUIRED:
      return t`WorkspaceId is required to create a view filter group.`;
    case ViewFilterGroupExceptionMessageKey.VIEW_ID_REQUIRED:
      return t`ViewId is required to create a view filter group.`;
    case ViewFilterGroupExceptionMessageKey.FIELD_METADATA_ID_REQUIRED:
      return t`FieldMetadataId is required to create a view filter group.`;
  }
};

