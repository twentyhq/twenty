import { CrowdinApiError } from '../errors/crowdin-api.error';

const IDENTICAL_TRANSLATION_CODE = 'identicalTranslation';
const VALIDATION_ERROR_CODE = 'validationError';

// validationError also covers unrelated refusals, so the wording has to narrow
// it down to the one that means the text we wanted is already there.
const DUPLICATE_TRANSLATION_REGEX = /duplicate translation/i;

type CrowdinErrorBody = {
  errors?: Array<{
    error?: { errors?: Array<{ code?: string; message?: string }> };
  }>;
};

export function isTranslationAlreadyPresentError(error: unknown): boolean {
  if (!(error instanceof CrowdinApiError)) return false;

  try {
    const body = JSON.parse(error.body) as CrowdinErrorBody;

    return (body.errors ?? []).some((entry) =>
      (entry.error?.errors ?? []).some(
        (detail) =>
          detail.code === IDENTICAL_TRANSLATION_CODE ||
          (detail.code === VALIDATION_ERROR_CODE &&
            DUPLICATE_TRANSLATION_REGEX.test(detail.message ?? '')),
      ),
    );
  } catch {
    return false;
  }
}
