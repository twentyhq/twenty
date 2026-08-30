import { Readable } from 'stream';

import { type Request } from 'express';

import { MAX_DICTATION_AUDIO_BYTES } from 'src/engine/metadata-modules/ai/ai-transcription/constants/dictation-audio-limits.const';
import { readRequestAudio } from 'src/engine/metadata-modules/ai/ai-transcription/utils/read-request-audio.util';

const buildRequest = (chunks: Buffer[]): Request => {
  const stream = Readable.from(chunks) as unknown as Request;

  stream.destroy = jest.fn().mockReturnValue(stream) as Request['destroy'];

  return stream;
};

describe('readRequestAudio', () => {
  it('should read the recording off the request body', async () => {
    const request = buildRequest([Buffer.from('opus '), Buffer.from('frames')]);

    await expect(readRequestAudio(request)).resolves.toEqual({
      status: 'read',
      audio: Buffer.from('opus frames'),
    });
  });

  it('should refuse an empty body', async () => {
    await expect(readRequestAudio(buildRequest([]))).resolves.toEqual({
      status: 'invalid',
      reason: 'empty',
    });
  });

  // Refused mid-stream: the point is never to hold an oversized upload whole.
  it('should refuse a body past the cap without buffering the rest', async () => {
    const request = buildRequest([
      Buffer.alloc(MAX_DICTATION_AUDIO_BYTES),
      Buffer.alloc(1),
    ]);

    await expect(readRequestAudio(request)).resolves.toEqual({
      status: 'invalid',
      reason: 'too-large',
    });
    expect(request.destroy).toHaveBeenCalled();
  });

  it('should accept a body exactly at the cap', async () => {
    const request = buildRequest([Buffer.alloc(MAX_DICTATION_AUDIO_BYTES)]);
    const result = await readRequestAudio(request);

    expect(result.status).toBe('read');
  });
});
