import { Readable } from 'stream';

import { readReadablePrefix } from 'src/utils/read-readable-prefix';

describe('readReadablePrefix', () => {
  it('should return the whole content when it is shorter than the limit', async () => {
    const prefix = await readReadablePrefix(
      Readable.from(Buffer.from('hello')),
      1024,
    );

    expect(prefix.toString()).toBe('hello');
  });

  it('should stop at the limit and not buffer the rest of a large source', async () => {
    let producedBytes = 0;

    const stream = new Readable({
      read() {
        producedBytes += 1024;
        this.push(Buffer.alloc(1024, 0x61));

        if (producedBytes >= 1024 * 1024) {
          this.push(null);
        }
      },
    });

    const prefix = await readReadablePrefix(stream, 4096);

    expect(prefix.length).toBe(4096);
    expect(stream.destroyed).toBe(true);
    expect(producedBytes).toBeLessThan(1024 * 1024);
  });

  it('should bound the buffer to maxBytes even when a single chunk overshoots', async () => {
    const prefix = await readReadablePrefix(
      Readable.from(Buffer.alloc(64 * 1024, 0x61)),
      4096,
    );

    expect(prefix.length).toBe(4096);
  });

  it('should reject when the stream errors before the limit', async () => {
    const stream = new Readable({
      read() {
        this.destroy(new Error('storage exploded'));
      },
    });

    await expect(readReadablePrefix(stream, 4096)).rejects.toThrow(
      'storage exploded',
    );
  });

  it('should return an empty buffer for an empty stream', async () => {
    const prefix = await readReadablePrefix(Readable.from([]), 4096);

    expect(prefix.length).toBe(0);
  });
});
