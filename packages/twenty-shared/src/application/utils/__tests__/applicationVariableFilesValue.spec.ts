import {
  deserializeApplicationVariableValue,
  serializeApplicationVariableValue,
} from '@/application/utils/applicationVariableValueSerialization';
import {
  isApplicationVariableFileValue,
  parseApplicationVariableFilesValue,
  toStoredApplicationVariableFileValue,
} from '@/application/utils/applicationVariableFilesValue';
import { FieldMetadataType } from '@/types/FieldMetadataType';

const LOGO_FILE = {
  fileId: '20202020-0000-4000-8000-000000000001',
  label: 'logo.png',
  extension: '.png',
};

describe('isApplicationVariableFileValue', () => {
  it('should accept a file reference', () => {
    expect(isApplicationVariableFileValue(LOGO_FILE)).toBe(true);
    expect(
      isApplicationVariableFileValue({ ...LOGO_FILE, url: 'https://x' }),
    ).toBe(true);
  });

  it('should refuse anything without a fileId and a label', () => {
    expect(isApplicationVariableFileValue(null)).toBe(false);
    expect(isApplicationVariableFileValue('logo.png')).toBe(false);
    expect(isApplicationVariableFileValue([LOGO_FILE])).toBe(false);
    expect(isApplicationVariableFileValue({ fileId: LOGO_FILE.fileId })).toBe(
      false,
    );
    expect(isApplicationVariableFileValue({ label: 'logo.png' })).toBe(false);
    expect(isApplicationVariableFileValue({ ...LOGO_FILE, fileId: '' })).toBe(
      false,
    );
  });

  it('should refuse a non-string extension or url', () => {
    expect(
      isApplicationVariableFileValue({ ...LOGO_FILE, extension: 123 }),
    ).toBe(false);
    expect(isApplicationVariableFileValue({ ...LOGO_FILE, url: {} })).toBe(
      false,
    );
  });
});

describe('toStoredApplicationVariableFileValue', () => {
  it('should keep the identity of the file and drop its url', () => {
    expect(
      toStoredApplicationVariableFileValue({ ...LOGO_FILE, url: 'https://x' }),
    ).toEqual(LOGO_FILE);
  });

  it('should omit an empty extension', () => {
    expect(
      toStoredApplicationVariableFileValue({ ...LOGO_FILE, extension: '' }),
    ).toEqual({ fileId: LOGO_FILE.fileId, label: LOGO_FILE.label });
  });
});

describe('parseApplicationVariableFilesValue', () => {
  it('should read an empty value as no file', () => {
    expect(parseApplicationVariableFilesValue('')).toEqual([]);
  });

  it('should keep only the file references of a list', () => {
    expect(
      parseApplicationVariableFilesValue(
        JSON.stringify([LOGO_FILE, 'not-a-file', { fileId: 'x' }]),
      ),
    ).toEqual([LOGO_FILE]);
  });

  it('should read malformed or non-list values as no file', () => {
    expect(parseApplicationVariableFilesValue('{')).toEqual([]);
    expect(parseApplicationVariableFilesValue('{"fileId":"x"}')).toEqual([]);
  });
});

describe('FILES application variable serialization', () => {
  it('should serialize a file list as JSON and an empty list as an empty string', () => {
    expect(
      serializeApplicationVariableValue([LOGO_FILE], FieldMetadataType.FILES),
    ).toBe(JSON.stringify([LOGO_FILE]));
    expect(serializeApplicationVariableValue([], FieldMetadataType.FILES)).toBe(
      '',
    );
    expect(
      serializeApplicationVariableValue(null, FieldMetadataType.FILES),
    ).toBe('');
  });

  it('should strip the read urls of a file list', () => {
    expect(
      serializeApplicationVariableValue(
        [{ ...LOGO_FILE, url: 'https://signed/logo' }],
        FieldMetadataType.FILES,
      ),
    ).toBe(JSON.stringify([LOGO_FILE]));
  });

  it('should keep an already serialized list and drop a scalar', () => {
    expect(
      serializeApplicationVariableValue(
        JSON.stringify([LOGO_FILE]),
        FieldMetadataType.FILES,
      ),
    ).toBe(JSON.stringify([LOGO_FILE]));
    expect(
      serializeApplicationVariableValue('logo.png', FieldMetadataType.FILES),
    ).toBe('');
  });

  it('should deserialize to the file list', () => {
    expect(
      deserializeApplicationVariableValue(
        JSON.stringify([LOGO_FILE]),
        FieldMetadataType.FILES,
      ),
    ).toEqual([LOGO_FILE]);
    expect(
      deserializeApplicationVariableValue('', FieldMetadataType.FILES),
    ).toEqual([]);
  });
});
