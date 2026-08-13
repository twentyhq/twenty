// Object <-> JSON byte buffer. Pairs with compact/expand:
// pack = compact -> serialize, unpack = deserialize -> expand.
export const serializeCacheBlob = (value: unknown): Buffer =>
  Buffer.from(JSON.stringify(value), 'utf8');

export const deserializeCacheBlob = <TValue>(blob: Buffer): TValue =>
  JSON.parse(blob.toString('utf8')) as TValue;
