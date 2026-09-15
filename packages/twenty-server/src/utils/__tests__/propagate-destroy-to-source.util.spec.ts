import { once } from 'events';
import { PassThrough, Readable } from 'stream';

import { ChecksumStream } from '@smithy/util-stream';

import { propagateDestroyToSource } from 'src/utils/propagate-destroy-to-source.util';

jest.useRealTimers();

const onceWithin = (stream: Readable, event: string) =>
  Promise.race([
    once(stream, event),
    new Promise((_resolve, reject) =>
      setTimeout(
        () => reject(new Error(`${event} not emitted within 1s`)),
        1000,
      ).unref(),
    ),
  ]);

describe('propagateDestroyToSource', () => {
  it('returns the same stream instance', () => {
    const stream = new PassThrough();

    expect(propagateDestroyToSource(stream)).toBe(stream);
  });

  it('destroys the wrapped source when the wrapper is destroyed unread', async () => {
    const source = new PassThrough();
    const wrapper = new PassThrough() as PassThrough & { source: Readable };

    wrapper.source = source;

    propagateDestroyToSource(wrapper).destroy();
    await onceWithin(source, 'close');

    expect(source.destroyed).toBe(true);
  });

  it('leaves a fully consumed source alone so its socket stays reusable', async () => {
    const source = new PassThrough({ autoDestroy: false });
    const wrapper = new PassThrough() as PassThrough & { source: Readable };

    wrapper.source = source;
    source.resume();
    source.end();
    await onceWithin(source, 'end');

    propagateDestroyToSource(wrapper).destroy();
    await onceWithin(wrapper, 'close');

    expect(source.readableEnded).toBe(true);
    expect(source.destroyed).toBe(false);
  });

  it('tolerates a stream with no source', async () => {
    const stream = new PassThrough();

    propagateDestroyToSource(stream).destroy();
    await onceWithin(stream, 'close');

    expect(stream.destroyed).toBe(true);
  });

  it('reaches the response stream behind a real SDK ChecksumStream', async () => {
    const source = new PassThrough();
    const wrapper = new ChecksumStream({
      source,
      checksum: {
        update: () => {},
        digest: async () => new Uint8Array(),
        reset: () => {},
      },
      checksumSourceLocation: 'x-amz-checksum-crc32',
      expectedChecksum: 'AA==',
    });

    propagateDestroyToSource(wrapper).destroy();
    await onceWithin(source, 'close');

    expect(source.destroyed).toBe(true);
  });
});
