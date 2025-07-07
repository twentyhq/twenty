import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { FieldMetadataException } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FieldMetadataValidationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-validation.service';

describe('FieldMetadataValidationService', () => {
  let service: FieldMetadataValidationService;
  const dummy = {} as any;

  beforeAll(() => {
    service = new FieldMetadataValidationService(dummy);
  });

  it('should validate NUMBER settings successfully', async () => {
    const settings = { decimals: 2, type: 'number' } as FieldMetadataSettings;

    await expect(
      service.validateSettingsOrThrow({
        fieldType: FieldMetadataType.NUMBER,
        settings,
      }),
    ).resolves.not.toThrow();
  });

  it('should throw an error for invalid NUMBER settings', async () => {
    const settings = { type: 'invalidType' } as FieldMetadataSettings;

    await expect(
      service.validateSettingsOrThrow({
        fieldType: FieldMetadataType.NUMBER,
        settings,
      }),
    ).rejects.toThrow(FieldMetadataException);
  });

  it('should validate TEXT settings successfully', async () => {
    const settings = { displayedMaxRows: 10 } as FieldMetadataSettings;

    await expect(
      service.validateSettingsOrThrow({
        fieldType: FieldMetadataType.TEXT,
        settings,
      }),
    ).resolves.not.toThrow();
  });

  it('should throw an error for invalid TEXT settings', async () => {
    const settings = {
      displayedMaxRows: 'NotANumber',
    } as FieldMetadataSettings;

    await expect(
      service.validateSettingsOrThrow({
        fieldType: FieldMetadataType.TEXT,
        settings,
      }),
    ).rejects.toThrow(FieldMetadataException);
  });
});
