import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum DashboardExceptionCode {
  DASHBOARD_NOT_FOUND = 'DASHBOARD_NOT_FOUND',
  DASHBOARD_DUPLICATION_FAILED = 'DASHBOARD_DUPLICATION_FAILED',
  PAGE_LAYOUT_NOT_FOUND = 'PAGE_LAYOUT_NOT_FOUND',
}

export enum DashboardExceptionMessageKey {
  DASHBOARD_NOT_FOUND = 'DASHBOARD_NOT_FOUND',
  DASHBOARD_DUPLICATION_FAILED = 'DASHBOARD_DUPLICATION_FAILED',
  PAGE_LAYOUT_NOT_FOUND = 'PAGE_LAYOUT_NOT_FOUND',
}

export class DashboardException extends CustomException<DashboardExceptionCode> {}

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
    default:
      assertUnreachable(key);
  }
};
