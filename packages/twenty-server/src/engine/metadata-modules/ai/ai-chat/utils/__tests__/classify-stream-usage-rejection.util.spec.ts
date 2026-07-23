import { NoOutputGeneratedError } from 'ai';

import { classifyStreamUsageRejection } from 'src/engine/metadata-modules/ai/ai-chat/utils/classify-stream-usage-rejection.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

describe('classifyStreamUsageRejection', () => {
  it('skips AbortError rejections', () => {
    const abortError = new Error('The operation was aborted');

    abortError.name = 'AbortError';

    expect(classifyStreamUsageRejection(abortError)).toBe('skip');
  });

  it('skips non-Error abort reasons carrying the AbortError name', () => {
    expect(classifyStreamUsageRejection({ name: 'AbortError' })).toBe('skip');
  });

  it('skips the expected shutdown-drain stream interruption', () => {
    const streamInterruptedException = new AiException(
      'The response was interrupted before it could finish.',
      AiExceptionCode.STREAM_INTERRUPTED,
    );

    expect(classifyStreamUsageRejection(streamInterruptedException)).toBe(
      'skip',
    );
  });

  it('passes through AiExceptions with other codes', () => {
    const executionFailedException = new AiException(
      'Agent execution failed.',
      AiExceptionCode.AGENT_EXECUTION_FAILED,
    );

    expect(classifyStreamUsageRejection(executionFailedException)).toBe(
      'passthrough',
    );
  });

  it('enriches the bare NoOutputGeneratedError from the SDK', () => {
    const noOutputGeneratedError = new NoOutputGeneratedError({
      message: 'No output generated. Check the stream for errors.',
    });

    expect(classifyStreamUsageRejection(noOutputGeneratedError)).toBe('enrich');
  });

  it('passes through unexpected errors', () => {
    expect(classifyStreamUsageRejection(new Error('boom'))).toBe('passthrough');
  });

  it('passes through non-Error rejection values', () => {
    expect(classifyStreamUsageRejection('boom')).toBe('passthrough');
    expect(classifyStreamUsageRejection(undefined)).toBe('passthrough');
    expect(classifyStreamUsageRejection(null)).toBe('passthrough');
  });
});
