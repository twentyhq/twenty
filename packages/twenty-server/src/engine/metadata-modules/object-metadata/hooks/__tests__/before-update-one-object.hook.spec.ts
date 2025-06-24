import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { i18n } from '@lingui/core';
import { UpdateOneInputType } from '@ptc-org/nestjs-query-graphql';
import { Repository } from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { UpdateObjectPayload } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { BeforeUpdateOneObject } from 'src/engine/metadata-modules/object-metadata/hooks/before-update-one-object.hook';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';

jest.mock('@lingui/core', () => ({
  i18n: {
    _: jest.fn().mockImplementation((messageId) => `translated:${messageId}`),
  },
}));

type UpdateObjectPayloadForTest = Omit<
  UpdateObjectPayload,
  'id' | 'workspaceId'
>;

describe('BeforeUpdateOneObject', () => {
  let hook: BeforeUpdateOneObject<UpdateObjectPayload>;
  let objectMetadataService: ObjectMetadataService;
  let fieldMetadataRepository: Repository<FieldMetadataEntity>;

  const mockWorkspaceId = 'workspace-id';
  const mockObjectId = 'object-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeforeUpdateOneObject,
        {
          provide: ObjectMetadataService,
          useValue: {
            findOneWithinWorkspace: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FieldMetadataEntity, 'core'),
          useValue: {
            findBy: jest.fn(),
          },
        },
      ],
    }).compile();

    hook = module.get<BeforeUpdateOneObject<UpdateObjectPayload>>(
      BeforeUpdateOneObject,
    );
    objectMetadataService = module.get<ObjectMetadataService>(
      ObjectMetadataService,
    );
    fieldMetadataRepository = module.get<Repository<FieldMetadataEntity>>(
      getRepositoryToken(FieldMetadataEntity, 'core'),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw UnauthorizedException if workspaceId is not provided', async () => {
    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        isActive: true,
      },
    };

    await expect(
      hook.run(instance as UpdateOneInputType<UpdateObjectPayload>, {
        workspaceId: '',
        locale: undefined,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw BadRequestException if object does not exist', async () => {
    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        isActive: true,
      },
    };

    jest
      .spyOn(objectMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(null as unknown as ObjectMetadataEntity);

    await expect(
      hook.run(instance as UpdateOneInputType<UpdateObjectPayload>, {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should not affect custom objects', async () => {
    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        nameSingular: 'newName',
        isActive: true,
      },
    };

    const mockObject: Partial<ObjectMetadataEntity> = {
      id: mockObjectId,
      isCustom: true,
    };

    jest
      .spyOn(objectMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockObject as ObjectMetadataEntity);

    jest.spyOn(fieldMetadataRepository, 'findBy').mockResolvedValue([]);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateObjectPayload>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    expect(result).toEqual(instance);
  });

  it('should throw BadRequestException when trying to update non-updatable fields on standard objects', async () => {
    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        nameSingular: 'newName',
      },
    };

    const mockObject: Partial<ObjectMetadataEntity> = {
      id: mockObjectId,
      isCustom: false,
    };

    jest
      .spyOn(objectMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockObject as ObjectMetadataEntity);

    await expect(
      hook.run(instance as UpdateOneInputType<UpdateObjectPayload>, {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when trying to update labels when they are synced with name', async () => {
    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        labelSingular: 'New Label',
      },
    };

    const mockObject: Partial<ObjectMetadataEntity> = {
      id: mockObjectId,
      isCustom: false,
      isLabelSyncedWithName: true,
      labelSingular: 'Old Label',
    };

    jest
      .spyOn(objectMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockObject as ObjectMetadataEntity);

    await expect(
      hook.run(instance as UpdateOneInputType<UpdateObjectPayload>, {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should handle isActive updates for standard objects', async () => {
    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        isActive: false,
      },
    };

    const mockObject: Partial<ObjectMetadataEntity> = {
      id: mockObjectId,
      isCustom: false,
      isActive: true,
    };

    jest
      .spyOn(objectMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockObject as ObjectMetadataEntity);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateObjectPayload>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    const expectedResult = {
      id: mockObjectId,
      update: {
        isActive: false,
        standardOverrides: {},
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should handle isLabelSyncedWithName updates for standard objects', async () => {
    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        isLabelSyncedWithName: true,
      },
    };

    const mockObject: Partial<ObjectMetadataEntity> = {
      id: mockObjectId,
      isCustom: false,
      isLabelSyncedWithName: false,
      standardOverrides: {
        labelSingular: 'Custom Label',
        labelPlural: 'Custom Labels',
      },
    };

    jest
      .spyOn(objectMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockObject as ObjectMetadataEntity);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateObjectPayload>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    const expectedResult = {
      id: mockObjectId,
      update: {
        isLabelSyncedWithName: true,
        standardOverrides: {
          labelSingular: null,
          labelPlural: null,
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should handle labelSingular override when not synced with name', async () => {
    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        labelSingular: 'New Label',
      },
    };

    const mockObject: Partial<ObjectMetadataEntity> = {
      id: mockObjectId,
      isCustom: false,
      isLabelSyncedWithName: false,
      labelSingular: 'Default Label',
    };

    jest
      .spyOn(objectMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockObject as ObjectMetadataEntity);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateObjectPayload>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    const expectedResult = {
      id: mockObjectId,
      update: {
        standardOverrides: {
          labelSingular: 'New Label',
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should handle labelPlural override when not synced with name', async () => {
    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        labelPlural: 'New Labels',
      },
    };

    const mockObject: Partial<ObjectMetadataEntity> = {
      id: mockObjectId,
      isCustom: false,
      isLabelSyncedWithName: false,
      labelPlural: 'Default Labels',
    };

    jest
      .spyOn(objectMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockObject as ObjectMetadataEntity);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateObjectPayload>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    const expectedResult = {
      id: mockObjectId,
      update: {
        standardOverrides: {
          labelPlural: 'New Labels',
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should reset labelSingular override when it matches the original value', async () => {
    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        labelSingular: 'Default Label',
      },
    };

    const mockObject: Partial<ObjectMetadataEntity> = {
      id: mockObjectId,
      isCustom: false,
      isLabelSyncedWithName: false,
      labelSingular: 'Default Label',
      standardOverrides: {
        labelSingular: 'Custom Label',
      },
    };

    jest
      .spyOn(objectMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockObject as ObjectMetadataEntity);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateObjectPayload>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    const expectedResult = {
      id: mockObjectId,
      update: {
        standardOverrides: {
          labelSingular: null,
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should handle description override', async () => {
    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        description: 'New Description',
      },
    };

    const mockObject: Partial<ObjectMetadataEntity> = {
      id: mockObjectId,
      isCustom: false,
      description: 'Default Description',
    };

    jest
      .spyOn(objectMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockObject as ObjectMetadataEntity);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateObjectPayload>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    const expectedResult = {
      id: mockObjectId,
      update: {
        standardOverrides: {
          description: 'New Description',
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should handle icon override', async () => {
    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        icon: 'IconStar',
      },
    };

    const mockObject: Partial<ObjectMetadataEntity> = {
      id: mockObjectId,
      isCustom: false,
      icon: 'IconCircle',
    };

    jest
      .spyOn(objectMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockObject as ObjectMetadataEntity);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateObjectPayload>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    const expectedResult = {
      id: mockObjectId,
      update: {
        standardOverrides: {
          icon: 'IconStar',
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should handle locale-specific translations', async () => {
    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        labelSingular: 'Étiquette',
        labelPlural: 'Étiquettes',
        description: 'Description en français',
      },
    };

    const mockObject: Partial<ObjectMetadataEntity> = {
      id: mockObjectId,
      isCustom: false,
      isLabelSyncedWithName: false,
      labelSingular: 'Label',
      labelPlural: 'Labels',
      description: 'Description',
    };

    jest
      .spyOn(objectMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockObject as ObjectMetadataEntity);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateObjectPayload>,
      {
        workspaceId: mockWorkspaceId,
        locale: 'fr-FR',
      },
    );

    const expectedResult = {
      id: mockObjectId,
      update: {
        standardOverrides: {
          translations: {
            'fr-FR': {
              labelSingular: 'Étiquette',
              labelPlural: 'Étiquettes',
              description: 'Description en français',
            },
          },
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should reset locale-specific translations when they match translated defaults', async () => {
    const translatedLabel = 'translated:msg-label';

    (i18n._ as jest.Mock).mockImplementation(() => translatedLabel);

    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        labelSingular: translatedLabel,
      },
    };

    const mockObject: Partial<ObjectMetadataEntity> = {
      id: mockObjectId,
      isCustom: false,
      isLabelSyncedWithName: false,
      labelSingular: 'Label',
      standardOverrides: {
        translations: {
          'fr-FR': {
            labelSingular: 'Ancienne Étiquette',
          },
        },
      },
    };

    jest
      .spyOn(objectMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockObject as ObjectMetadataEntity);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateObjectPayload>,
      {
        workspaceId: mockWorkspaceId,
        locale: 'fr-FR',
      },
    );

    const expectedResult = {
      id: mockObjectId,
      update: {
        standardOverrides: {
          translations: {
            'fr-FR': {
              labelSingular: null,
            },
          },
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should handle multiple updates together', async () => {
    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        isActive: false,
        isLabelSyncedWithName: false,
        labelSingular: 'New Label',
        labelPlural: 'New Labels',
        icon: 'IconStar',
        description: 'New Description',
      },
    };

    const mockObject: Partial<ObjectMetadataEntity> = {
      id: mockObjectId,
      isCustom: false,
      isActive: true,
      isLabelSyncedWithName: false,
      labelSingular: 'Default Label',
      labelPlural: 'Default Labels',
      icon: 'IconCircle',
      description: 'Default Description',
    };

    jest
      .spyOn(objectMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockObject as ObjectMetadataEntity);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateObjectPayload>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    const expectedResult = {
      id: mockObjectId,
      update: {
        isActive: false,
        isLabelSyncedWithName: false,
        standardOverrides: {
          labelSingular: 'New Label',
          labelPlural: 'New Labels',
          icon: 'IconStar',
          description: 'New Description',
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should validate label identifier field correctly for custom objects', async () => {
    const labelIdentifierFieldId = 'label-field-id';
    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        labelIdentifierFieldMetadataId: labelIdentifierFieldId,
      },
    };

    const mockObject: Partial<ObjectMetadataEntity> = {
      id: mockObjectId,
      isCustom: true,
    };

    jest
      .spyOn(objectMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockObject as ObjectMetadataEntity);

    jest
      .spyOn(fieldMetadataRepository, 'findBy')
      .mockImplementation(async (criteria) => {
        expect(criteria).toHaveProperty('workspaceId');
        expect(criteria).toHaveProperty('objectMetadataId');
        expect(criteria).toHaveProperty('id');

        return [{ id: labelIdentifierFieldId } as FieldMetadataEntity];
      });

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateObjectPayload>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    expect(result).toEqual(instance);
  });

  it('should validate image identifier field correctly for custom objects', async () => {
    const imageIdentifierFieldId = 'image-field-id';
    const instance: UpdateOneInputType<UpdateObjectPayloadForTest> = {
      id: mockObjectId,
      update: {
        imageIdentifierFieldMetadataId: imageIdentifierFieldId,
      },
    };

    const mockObject: Partial<ObjectMetadataEntity> = {
      id: mockObjectId,
      isCustom: true,
    };

    jest
      .spyOn(objectMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockObject as ObjectMetadataEntity);

    jest
      .spyOn(fieldMetadataRepository, 'findBy')
      .mockImplementation(async (criteria) => {
        expect(criteria).toHaveProperty('workspaceId');
        expect(criteria).toHaveProperty('objectMetadataId');
        expect(criteria).toHaveProperty('id');

        return [{ id: imageIdentifierFieldId } as FieldMetadataEntity];
      });

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateObjectPayload>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    expect(result).toEqual(instance);
  });
});
