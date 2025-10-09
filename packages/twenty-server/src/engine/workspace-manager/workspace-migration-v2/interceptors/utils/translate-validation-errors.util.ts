import { type I18n, type MessageDescriptor } from '@lingui/core';

import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type OrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';

export type TranslatedFlatEntityValidationError<TCode extends string = string> =
  {
    code: TCode;
    message: string;
    userFriendlyMessage?: string;
    value?: unknown;
  };

export const translateValidationError = <TCode extends string = string>(
  error: FlatEntityValidationError<TCode>,
  i18n: I18n,
): TranslatedFlatEntityValidationError<TCode> => {
  return {
    ...error,
    userFriendlyMessage: error.userFriendlyMessage
      ? i18n._(error.userFriendlyMessage)
      : undefined,
  };
};

export const translateValidationErrors = <TCode extends string = string>(
  errors: FlatEntityValidationError<TCode>[],
  i18n: I18n,
): TranslatedFlatEntityValidationError<TCode>[] => {
  return errors.map((error) => translateValidationError(error, i18n));
};

// Generic function to translate MessageDescriptors in any object structure
export const translateMessageDescriptorsInObject = <T>(
  obj: T,
  i18n: I18n,
): T => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // Check if it's a MessageDescriptor
  if (
    typeof obj === 'object' &&
    'id' in obj &&
    'message' in obj &&
    typeof (obj as MessageDescriptor).id === 'string'
  ) {
    return i18n._(obj as MessageDescriptor) as T;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      translateMessageDescriptorsInObject(item, i18n),
    ) as T;
  }

  // Handle objects
  const result = {} as T;

  for (const [key, value] of Object.entries(obj)) {
    (result as Record<string, unknown>)[key] =
      translateMessageDescriptorsInObject(value, i18n);
  }

  return result;
};

// Properly typed function to translate the entire report
export const translateOrchestratorFailureReport = (
  report: OrchestratorFailureReport,
  i18n: I18n,
): OrchestratorFailureReport => {
  return translateMessageDescriptorsInObject(report, i18n);
};
