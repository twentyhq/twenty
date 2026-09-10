import { CrowdinApiError } from '../errors/crowdin-api.error';

const IDENTICAL_TRANSLATION_CODE = 'identicalTranslation';

export function isIdenticalTranslationError(error: unknown): boolean {
  if (!(error instanceof CrowdinApiError)) return false;

  type ErrorBody = {
    errors?: Array<{ error?: { errors?: Array<{ code?: string }> } }>;
  };

  try {
    const body = JSON.parse(error.body) as ErrorBody;

    return (body.errors ?? []).some((entry) =>
      (entry.error?.errors ?? []).some(
        (detail) => detail.code === IDENTICAL_TRANSLATION_CODE,
      ),
    );
  } catch {
    return false;
  }
}
