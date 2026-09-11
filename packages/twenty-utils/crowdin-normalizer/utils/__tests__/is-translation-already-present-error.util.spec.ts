import { CrowdinApiError } from '../../errors/crowdin-api.error';
import { isTranslationAlreadyPresentError } from '../is-translation-already-present-error.util';

const buildError = (body: string) => new CrowdinApiError(400, body);

const buildDetailError = (detail: { code: string; message: string }) =>
  buildError(
    JSON.stringify({
      errors: [{ error: { key: 'translation', errors: [detail] } }],
    }),
  );

describe('isTranslationAlreadyPresentError', () => {
  it('recognises the identical-translation error code', () => {
    expect(
      isTranslationAlreadyPresentError(
        buildDetailError({
          code: 'identicalTranslation',
          message: 'Identical translation already saved',
        }),
      ),
    ).toBe(true);
  });

  it('recognises the duplicate-translation validation error', () => {
    expect(
      isTranslationAlreadyPresentError(
        buildDetailError({
          code: 'validationError',
          message: 'Duplicate translation. Please vote or approve the original.',
        }),
      ),
    ).toBe(true);
  });

  it('does not swallow an unrelated validation error', () => {
    expect(
      isTranslationAlreadyPresentError(
        buildDetailError({
          code: 'validationError',
          message: 'Translation is too long',
        }),
      ),
    ).toBe(false);
  });

  it('does not treat another failure as present because of its wording', () => {
    expect(
      isTranslationAlreadyPresentError(
        buildDetailError({
          code: 'notFound',
          message: 'String is identical to a deleted one',
        }),
      ),
    ).toBe(false);
  });

  it('rejects a non-JSON body and any non-Crowdin error', () => {
    expect(
      isTranslationAlreadyPresentError(buildError('<html>502</html>')),
    ).toBe(false);
    expect(isTranslationAlreadyPresentError(new Error('identical'))).toBe(false);
  });
});
