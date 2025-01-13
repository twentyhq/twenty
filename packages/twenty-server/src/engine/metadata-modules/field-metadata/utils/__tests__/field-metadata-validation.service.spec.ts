import { FieldMetadataType } from 'twenty-shared';

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { FieldMetadataValidationService } from 'src/engine/metadata-modules/field-metadata/field-metadata-validation.service';
import { FieldMetadataException } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

describe('FieldMetadataValidationService', () => {
  let service: FieldMetadataValidationService;

  beforeAll(() => {
    service = new FieldMetadataValidationService();
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
