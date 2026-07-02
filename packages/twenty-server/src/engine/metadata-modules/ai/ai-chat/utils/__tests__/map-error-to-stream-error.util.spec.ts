import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import {
  STREAM_EXECUTION_FAILED_CODE,
  mapErrorToStreamError,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/map-error-to-stream-error.util';

describe('mapErrorToStreamError', () => {
  it('maps an AiException to its typed code and message', () => {
    const error = new AiException(
      'No AI models are available. Configure at least one AI provider.',
      AiExceptionCode.API_KEY_NOT_CONFIGURED,
    );

    expect(mapErrorToStreamError(error)).toEqual({
      code: AiExceptionCode.API_KEY_NOT_CONFIGURED,
      message:
        'No AI models are available. Configure at least one AI provider.',
    });
  });

  it('collapses a generic Error to the fallback code but keeps its message', () => {
    expect(mapErrorToStreamError(new Error('Provider timed out'))).toEqual({
      code: STREAM_EXECUTION_FAILED_CODE,
      message: 'Provider timed out',
    });
  });

  it('handles non-Error values with a stable fallback', () => {
    expect(mapErrorToStreamError('boom')).toEqual({
      code: STREAM_EXECUTION_FAILED_CODE,
      message: 'Stream execution failed',
    });
  });
});
