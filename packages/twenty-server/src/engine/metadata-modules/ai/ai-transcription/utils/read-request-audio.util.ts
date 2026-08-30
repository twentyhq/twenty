import { type Request } from 'express';

import { MAX_DICTATION_AUDIO_BYTES } from 'src/engine/metadata-modules/ai/ai-transcription/constants/dictation-audio-limits.const';

export type ReadRequestAudioResult =
  | { status: 'read'; audio: Buffer }
  | { status: 'invalid'; reason: 'empty' | 'too-large' };

// The cap is enforced while the body arrives rather than after it, so an
// oversized upload is refused without ever being held whole in memory.
export const readRequestAudio = (
  request: Request,
): Promise<ReadRequestAudioResult> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let byteLength = 0;

    const settle = (result: ReadRequestAudioResult) => {
      request.removeAllListeners();
      resolve(result);
    };

    request.on('data', (chunk: Buffer) => {
      byteLength += chunk.byteLength;

      if (byteLength > MAX_DICTATION_AUDIO_BYTES) {
        request.destroy();
        settle({ status: 'invalid', reason: 'too-large' });

        return;
      }

      chunks.push(chunk);
    });

    request.on('end', () => {
      settle(
        byteLength === 0
          ? { status: 'invalid', reason: 'empty' }
          : { status: 'read', audio: Buffer.concat(chunks) },
      );
    });

    request.on('error', reject);
  });
