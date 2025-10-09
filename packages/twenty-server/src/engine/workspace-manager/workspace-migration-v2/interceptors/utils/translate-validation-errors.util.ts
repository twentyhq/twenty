import { type I18n } from '@lingui/core';

import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

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
