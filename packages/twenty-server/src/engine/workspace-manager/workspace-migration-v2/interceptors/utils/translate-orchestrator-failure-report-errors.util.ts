import { type I18n, type MessageDescriptor } from '@lingui/core';
import { isDefined } from 'twenty-shared/utils';

import { type OrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

const isMessageDescriptor = (obj: unknown): obj is MessageDescriptor =>
  isDefined(obj) &&
  typeof obj === 'object' &&
  Object.prototype.hasOwnProperty.call(obj, 'id') &&
  Object.prototype.hasOwnProperty.call(obj, 'message') &&
  typeof (obj as MessageDescriptor).id === 'string';

const translateUserFriendlyMessageInFlatEntityValidationError = <T>(
  obj: T,
  i18n: I18n,
  parentKey?: string,
): T => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (
    isMessageDescriptor(obj) &&
    isDefined(parentKey) &&
    parentKey ===
      ('userFriendlyMessage' as const satisfies keyof FlatEntityValidationError)
  ) {
    return i18n._(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      translateUserFriendlyMessageInFlatEntityValidationError(
        item,
        i18n,
        parentKey,
      ),
    ) as T;
  }

  const result = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    (result as Record<string, unknown>)[key] =
      translateUserFriendlyMessageInFlatEntityValidationError(value, i18n, key);
  }

  return result;
};

export const translateOrchestratorFailureReportErrors = (
  report: OrchestratorFailureReport,
  i18n: I18n,
) => {
  return translateUserFriendlyMessageInFlatEntityValidationError(report, i18n);
};
