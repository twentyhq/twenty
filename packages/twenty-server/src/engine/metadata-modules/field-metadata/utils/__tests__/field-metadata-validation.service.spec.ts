import { Test, type TestingModule } from '@nestjs/testing';

import {
  type FieldMetadataSettings,
  FieldMetadataType,
} from 'twenty-shared/types';

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
    const settings: FieldMetadataSettings<FieldMetadataType.NUMBER> = {
      decimals: 2,
      type: 'number',
    };

    await expect(
      service.validateSettingsOrThrow({
        fieldType: FieldMetadataType.NUMBER,
        settings,
      }),
    ).resolves.not.toThrow();
  });

  it('should throw an error for invalid NUMBER settings', async () => {
    const settings: FieldMetadataSettings<FieldMetadataType.NUMBER> = {
      // @ts-expect-error expected invalid payload below
      type: 'invalidType',
    };

    await expect(
      service.validateSettingsOrThrow({
        fieldType: FieldMetadataType.NUMBER,
        settings,
      }),
    ).rejects.toThrow(FieldMetadataException);
  });

  it('should validate TEXT settings successfully', async () => {
    const settings: FieldMetadataSettings<FieldMetadataType.TEXT> = {
      displayedMaxRows: 10,
    };

    await expect(
      service.validateSettingsOrThrow({
        fieldType: FieldMetadataType.TEXT,
        settings,
      }),
    ).resolves.not.toThrow();
  });

  it('should throw an error for invalid TEXT settings', async () => {
    const settings: FieldMetadataSettings<FieldMetadataType.TEXT> = {
      // @ts-expect-error expected invalid payload below
      displayedMaxRows: 'NotANumber',
    };

    await expect(
      service.validateSettingsOrThrow({
        fieldType: FieldMetadataType.TEXT,
        settings,
      }),
    ).rejects.toThrow(FieldMetadataException);
  });
});
