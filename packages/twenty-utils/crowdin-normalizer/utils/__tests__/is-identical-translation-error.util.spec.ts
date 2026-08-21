import { CrowdinApiError } from '../../errors/crowdin-api.error';
import { isIdenticalTranslationError } from '../is-identical-translation-error.util';

const buildError = (body: string) => new CrowdinApiError(400, body);

describe('isIdenticalTranslationError', () => {
  it('recognises the identical-translation error code', () => {
    const error = buildError(
      JSON.stringify({
        errors: [
          {
            error: {
              key: 'text',
              errors: [
                {
                  code: 'identicalTranslation',
                  message: 'Identical translation already saved',
                },
              ],
            },
          },
        ],
      }),
    );

    expect(isIdenticalTranslationError(error)).toBe(true);
  });

  it('does not treat another failure as identical because of its wording', () => {
    const error = buildError(
      JSON.stringify({
        errors: [
          {
            error: {
              key: 'stringId',
              errors: [
                {
                  code: 'notFound',
                  message: 'String is identical to a deleted one',
                },
              ],
            },
          },
        ],
      }),
    );

    expect(isIdenticalTranslationError(error)).toBe(false);
  });

  it('rejects a non-JSON body and any non-Crowdin error', () => {
    expect(isIdenticalTranslationError(buildError('<html>502</html>'))).toBe(
      false,
    );
    expect(isIdenticalTranslationError(new Error('identical'))).toBe(false);
  });
});
