import { type Readable } from 'stream';

import { isDefined } from 'twenty-shared/utils';

type ReadableWithSource = Readable & { source?: Readable };

export const propagateDestroyToSource = <TStream extends Readable>(
  stream: TStream,
): TStream => {
  stream.once('close', () => {
    const source = (stream as ReadableWithSource).source;

    if (isDefined(source) && !source.destroyed && !source.readableEnded) {
      source.on('error', () => {});
      source.destroy();
    }
  });

  return stream;
};
