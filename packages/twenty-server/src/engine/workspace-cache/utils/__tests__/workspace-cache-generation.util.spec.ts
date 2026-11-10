import {
  createWorkspaceCacheGeneration,
  isWorkspaceCacheGenerationExpired,
} from 'src/engine/workspace-cache/utils/workspace-cache-generation.util';

describe('isWorkspaceCacheGenerationExpired', () => {
  const now = 1_800_000_000_000;

  it('keeps a generation younger than the max age', () => {
    expect(
      isWorkspaceCacheGenerationExpired({
        generation: createWorkspaceCacheGeneration(now - 59_000),
        maxAgeMs: 60_000,
        now,
      }),
    ).toBe(false);
  });

  it('expires a generation older than the max age', () => {
    expect(
      isWorkspaceCacheGenerationExpired({
        generation: createWorkspaceCacheGeneration(now - 61_000),
        maxAgeMs: 60_000,
        now,
      }),
    ).toBe(true);
  });

  it('expires a generation written before creation times were recorded', () => {
    expect(
      isWorkspaceCacheGenerationExpired({
        generation: 'b5c4f7f2-8a3e-4b0e-9d4d-2f1c7a9e6b10',
        maxAgeMs: 60_000,
        now,
      }),
    ).toBe(true);
  });

  it('expires a generation stamped far in the future', () => {
    expect(
      isWorkspaceCacheGenerationExpired({
        generation: createWorkspaceCacheGeneration(now + 61_000),
        maxAgeMs: 60_000,
        now,
      }),
    ).toBe(true);
  });
});
