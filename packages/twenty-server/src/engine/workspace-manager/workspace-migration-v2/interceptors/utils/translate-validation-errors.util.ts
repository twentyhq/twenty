import { type I18n, type MessageDescriptor } from '@lingui/core';

import { type OrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';

export type TranslatedFlatEntityValidationError<TCode extends string = string> =
  {
    code: TCode;
    message: string;
    userFriendlyMessage?: string;
    value?: unknown;
  };

const translateMessageDescriptorsInObject = <T>(obj: T, i18n: I18n): T => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (
    typeof obj === 'object' &&
    'id' in obj &&
    'message' in obj &&
    typeof (obj as MessageDescriptor).id === 'string'
  ) {
    return i18n._(obj as MessageDescriptor) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      translateMessageDescriptorsInObject(item, i18n),
    ) as T;
  }

  const result = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    (result as Record<string, unknown>)[key] =
      translateMessageDescriptorsInObject(value, i18n);
  }

  return result;
};

export const translateOrchestratorFailureReport = (
  report: OrchestratorFailureReport,
  i18n: I18n,
): OrchestratorFailureReport => {
  return translateMessageDescriptorsInObject(report, i18n);
};
