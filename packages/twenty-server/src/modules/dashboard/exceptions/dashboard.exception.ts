import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum DashboardExceptionCode {
  DASHBOARD_NOT_FOUND = 'DASHBOARD_NOT_FOUND',
  DASHBOARD_DUPLICATION_FAILED = 'DASHBOARD_DUPLICATION_FAILED',
  PAGE_LAYOUT_NOT_FOUND = 'PAGE_LAYOUT_NOT_FOUND',
  DASHBOARD_RESTORATION_TO_SOFT_DELETED_STATE_FAILED = 'DASHBOARD_RESTORATION_TO_SOFT_DELETED_STATE_FAILED',
}

export enum DashboardExceptionMessageKey {
  DASHBOARD_NOT_FOUND = 'DASHBOARD_NOT_FOUND',
  DASHBOARD_DUPLICATION_FAILED = 'DASHBOARD_DUPLICATION_FAILED',
  PAGE_LAYOUT_NOT_FOUND = 'PAGE_LAYOUT_NOT_FOUND',
  DASHBOARD_RESTORATION_TO_SOFT_DELETED_STATE_FAILED = 'DASHBOARD_RESTORATION_TO_SOFT_DELETED_STATE_FAILED',
}

const getDashboardExceptionUserFriendlyMessage = (
  code: DashboardExceptionCode,
) => {
  switch (code) {
    case DashboardExceptionCode.DASHBOARD_NOT_FOUND:
      return msg`Dashboard not found.`;
    case DashboardExceptionCode.DASHBOARD_DUPLICATION_FAILED:
      return msg`Failed to duplicate dashboard.`;
    case DashboardExceptionCode.PAGE_LAYOUT_NOT_FOUND:
      return msg`Page layout not found.`;
    case DashboardExceptionCode.DASHBOARD_RESTORATION_TO_SOFT_DELETED_STATE_FAILED:
      return msg`Failed to restore dashboard(s) to soft deleted state.`;
    default:
      assertUnreachable(code);
  }
};

export class DashboardException extends CustomException<DashboardExceptionCode> {
  constructor(
    message: string,
    code: DashboardExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getDashboardExceptionUserFriendlyMessage(code),
    });
  }
}

export const generateDashboardExceptionMessage = (
  key: DashboardExceptionMessageKey,
  value?: string,
): string => {
  switch (key) {
    case DashboardExceptionMessageKey.DASHBOARD_NOT_FOUND:
      return `Dashboard with ID "${value}" not found`;
    case DashboardExceptionMessageKey.DASHBOARD_DUPLICATION_FAILED:
      return `Failed to duplicate dashboard: ${value}`;
    case DashboardExceptionMessageKey.PAGE_LAYOUT_NOT_FOUND:
      return `Page layout for dashboard "${value}" not found`;
    case DashboardExceptionMessageKey.DASHBOARD_RESTORATION_TO_SOFT_DELETED_STATE_FAILED:
      return `Failed to restore dashboard(s) to soft deleted state: ${value}`;
    default:
      assertUnreachable(key);
  }
};
