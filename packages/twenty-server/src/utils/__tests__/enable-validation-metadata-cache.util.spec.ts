import { getMetadataStorage, IsString } from 'class-validator';

import { enableValidationMetadataCache } from 'src/utils/enable-validation-metadata-cache.util';

class ValidatedInput {
  @IsString()
  name!: string;
}

describe('enableValidationMetadataCache', () => {
  it('should serve repeated identical lookups from cache (same array reference)', () => {
    enableValidationMetadataCache();
    const storage = getMetadataStorage();

    const first = storage.getTargetValidationMetadatas(
      ValidatedInput,
      '',
      true,
      false,
    );
    const second = storage.getTargetValidationMetadatas(
      ValidatedInput,
      '',
      true,
      false,
    );

    expect(first.length).toBeGreaterThan(0);
    expect(second).toBe(first);
  });

  it('should cache independently per lookup arguments', () => {
    enableValidationMetadataCache();
    const storage = getMetadataStorage();

    const noGroup = storage.getTargetValidationMetadatas(
      ValidatedInput,
      '',
      true,
      false,
    );
    const withGroup = storage.getTargetValidationMetadatas(
      ValidatedInput,
      '',
      true,
      false,
      ['a'],
    );

    expect(withGroup).not.toBe(noGroup);
  });

  it('should be idempotent when installed more than once', () => {
    enableValidationMetadataCache();
    enableValidationMetadataCache();
    const storage = getMetadataStorage();

    const result = storage.getTargetValidationMetadatas(
      ValidatedInput,
      '',
      true,
      false,
    );

    expect(Array.isArray(result)).toBe(true);
  });
});
