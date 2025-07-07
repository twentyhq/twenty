import { Test, TestingModule } from '@nestjs/testing';

import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { FieldMetadataException } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { FieldMetadataEnumValidationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-enum-validation.service';
import { FieldMetadataValidationService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-validation.service';

describe('FieldMetadataValidationService', () => {
  let service: FieldMetadataValidationService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldMetadataValidationService,
        {
          provide: FieldMetadataEnumValidationService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<FieldMetadataValidationService>(
      FieldMetadataValidationService,
    );
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
