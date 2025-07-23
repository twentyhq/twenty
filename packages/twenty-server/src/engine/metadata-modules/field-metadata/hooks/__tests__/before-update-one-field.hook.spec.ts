import { Test, TestingModule } from '@nestjs/testing';

import { i18n } from '@lingui/core';
import { UpdateOneInputType } from '@ptc-org/nestjs-query-graphql';
import { FieldMetadataType } from 'twenty-shared/types';

import {
  ForbiddenError,
  ValidationError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { BeforeUpdateOneField } from 'src/engine/metadata-modules/field-metadata/hooks/before-update-one-field.hook';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/services/field-metadata.service';
import { getMockFieldMetadataEntity } from 'src/utils/__test__/get-field-metadata-entity.mock';

jest.mock('@lingui/core', () => ({
  i18n: {
    _: jest.fn().mockImplementation((messageId) => `translated:${messageId}`),
  },
}));

// Create a type that omits id and workspaceId from UpdateFieldInput
type UpdateFieldInputForTest = Omit<UpdateFieldInput, 'id' | 'workspaceId'>;

describe('BeforeUpdateOneField', () => {
  let hook: BeforeUpdateOneField<UpdateFieldInput>;
  let fieldMetadataService: FieldMetadataService;

  const mockWorkspaceId = 'workspace-id';
  const mockFieldId = 'field-id';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BeforeUpdateOneField,
        {
          provide: FieldMetadataService,
          useValue: {
            findOneWithinWorkspace: jest.fn(),
          },
        },
      ],
    }).compile();

    hook =
      module.get<BeforeUpdateOneField<UpdateFieldInput>>(BeforeUpdateOneField);
    fieldMetadataService =
      module.get<FieldMetadataService>(FieldMetadataService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw ForbiddenError if workspaceId is not provided', async () => {
    const instance: UpdateOneInputType<UpdateFieldInputForTest> = {
      id: mockFieldId,
      update: {
        isActive: true,
      },
    };

    await expect(
      hook.run(instance as UpdateOneInputType<UpdateFieldInput>, {
        workspaceId: '',
        locale: undefined,
      }),
    ).rejects.toThrow(ForbiddenError);
  });

  it('should throw ValidationError if field does not exist', async () => {
    const instance: UpdateOneInputType<UpdateFieldInputForTest> = {
      id: mockFieldId,
      update: {
        isActive: true,
      },
    };

    jest
      .spyOn(fieldMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(null as unknown as FieldMetadataEntity);

    await expect(
      hook.run(instance as UpdateOneInputType<UpdateFieldInput>, {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('should not affect custom fields', async () => {
    const instance: UpdateOneInputType<UpdateFieldInputForTest> = {
      id: mockFieldId,
      update: {
        isActive: true,
        name: 'newName', // Custom fields can update all properties
      },
    };

    const mockField = getMockFieldMetadataEntity({
      workspaceId: mockWorkspaceId,
      objectMetadataId: '20202020-0000-0000-0000-000000000002',
      id: mockFieldId,
      type: FieldMetadataType.TEXT,
      name: 'oldName',
      label: 'Old Name',
      isNullable: true,
      isCustom: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    jest
      .spyOn(fieldMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockField);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateFieldInput>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    expect(result).toEqual(instance);
  });

  it('should throw ValidationError when trying to update non-updatable fields on standard fields', async () => {
    const instance: UpdateOneInputType<UpdateFieldInputForTest> = {
      id: mockFieldId,
      update: {
        name: 'newName', // Not allowed for standard fields
      },
    };

    const mockField = getMockFieldMetadataEntity({
      workspaceId: mockWorkspaceId,
      objectMetadataId: '20202020-0000-0000-0000-000000000002',
      id: mockFieldId,
      type: FieldMetadataType.TEXT,
      name: 'oldName',
      label: 'Old Name',
      isNullable: true,
      isCustom: false,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    jest
      .spyOn(fieldMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockField);

    await expect(
      hook.run(instance as UpdateOneInputType<UpdateFieldInput>, {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      }),
    ).rejects.toThrow(ValidationError);
  });

  it('should handle isActive updates for standard fields', async () => {
    const instance: UpdateOneInputType<UpdateFieldInputForTest> = {
      id: mockFieldId,
      update: {
        isActive: false,
      },
    };

    const mockField = getMockFieldMetadataEntity({
      workspaceId: mockWorkspaceId,
      objectMetadataId: '20202020-0000-0000-0000-000000000002',
      id: mockFieldId,
      type: FieldMetadataType.TEXT,
      name: 'oldName',
      label: 'Old Name',
      isNullable: true,
      isCustom: false,
      isActive: true,
      isLabelSyncedWithName: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    jest
      .spyOn(fieldMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockField);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateFieldInput>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    const expectedResult = {
      id: mockFieldId,
      update: {
        isActive: false,
        standardOverrides: {},
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should handle isLabelSyncedWithName updates for standard fields', async () => {
    const instance: UpdateOneInputType<UpdateFieldInputForTest> = {
      id: mockFieldId,
      update: {
        isLabelSyncedWithName: true,
      },
    };

    const mockField = getMockFieldMetadataEntity({
      workspaceId: mockWorkspaceId,
      objectMetadataId: '20202020-0000-0000-0000-000000000002',
      id: mockFieldId,
      type: FieldMetadataType.TEXT,
      name: 'oldName',
      label: 'Old Name',
      isNullable: true,
      isCustom: false,
      isLabelSyncedWithName: false,
      standardOverrides: {
        label: 'Custom Label',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    jest
      .spyOn(fieldMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockField);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateFieldInput>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    const expectedResult = {
      id: mockFieldId,
      update: {
        isLabelSyncedWithName: true,
        standardOverrides: {
          label: null,
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should handle label override when not synced with name', async () => {
    const instance: UpdateOneInputType<UpdateFieldInputForTest> = {
      id: mockFieldId,
      update: {
        label: 'New Label',
      },
    };

    const mockField = getMockFieldMetadataEntity({
      workspaceId: mockWorkspaceId,
      objectMetadataId: '20202020-0000-0000-0000-000000000002',
      id: mockFieldId,
      type: FieldMetadataType.TEXT,
      name: 'oldName',
      label: 'Default Label',
      isNullable: true,
      isCustom: false,
      isLabelSyncedWithName: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    jest
      .spyOn(fieldMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockField);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateFieldInput>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    const expectedResult = {
      id: mockFieldId,
      update: {
        standardOverrides: {
          label: 'New Label',
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should reset label override when it matches the original value', async () => {
    const instance: UpdateOneInputType<UpdateFieldInputForTest> = {
      id: mockFieldId,
      update: {
        label: 'Default Label',
      },
    };

    const mockField: Partial<FieldMetadataEntity> = {
      id: mockFieldId,
      isCustom: false,
      isLabelSyncedWithName: false,
      label: 'Default Label',
      standardOverrides: {
        label: 'Custom Label',
      },
    };

    jest
      .spyOn(fieldMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockField as FieldMetadataEntity);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateFieldInput>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    const expectedResult = {
      id: mockFieldId,
      update: {
        standardOverrides: {
          label: null,
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should handle description override', async () => {
    const instance: UpdateOneInputType<UpdateFieldInputForTest> = {
      id: mockFieldId,
      update: {
        description: 'New Description',
      },
    };

    const mockField: Partial<FieldMetadataEntity> = {
      id: mockFieldId,
      isCustom: false,
      description: 'Default Description',
    };

    jest
      .spyOn(fieldMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockField as FieldMetadataEntity);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateFieldInput>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    const expectedResult = {
      id: mockFieldId,
      update: {
        standardOverrides: {
          description: 'New Description',
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should handle icon override', async () => {
    const instance: UpdateOneInputType<UpdateFieldInputForTest> = {
      id: mockFieldId,
      update: {
        icon: 'IconStar',
      },
    };

    const mockField: Partial<FieldMetadataEntity> = {
      id: mockFieldId,
      isCustom: false,
      icon: 'IconCircle',
    };

    jest
      .spyOn(fieldMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockField as FieldMetadataEntity);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateFieldInput>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    const expectedResult = {
      id: mockFieldId,
      update: {
        standardOverrides: {
          icon: 'IconStar',
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should handle locale-specific translations', async () => {
    const instance: UpdateOneInputType<UpdateFieldInputForTest> = {
      id: mockFieldId,
      update: {
        label: 'Étiquette',
        description: 'Description en français',
      },
    };

    const mockField: Partial<FieldMetadataEntity> = {
      id: mockFieldId,
      isCustom: false,
      isLabelSyncedWithName: false,
      label: 'Label',
      description: 'Description',
    };

    jest
      .spyOn(fieldMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockField as FieldMetadataEntity);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateFieldInput>,
      {
        workspaceId: mockWorkspaceId,
        locale: 'fr-FR',
      },
    );

    // The expected result returned by the hook
    const expectedResult = {
      id: mockFieldId,
      update: {
        standardOverrides: {
          translations: {
            'fr-FR': {
              label: 'Étiquette',
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

    const instance: UpdateOneInputType<UpdateFieldInputForTest> = {
      id: mockFieldId,
      update: {
        label: translatedLabel,
      },
    };

    const mockField: Partial<FieldMetadataEntity> = {
      id: mockFieldId,
      isCustom: false,
      isLabelSyncedWithName: false,
      label: 'Label',
      standardOverrides: {
        translations: {
          'fr-FR': {
            label: 'Ancienne Étiquette',
          },
        },
      },
    };

    jest
      .spyOn(fieldMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockField as FieldMetadataEntity);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateFieldInput>,
      {
        workspaceId: mockWorkspaceId,
        locale: 'fr-FR',
      },
    );

    const expectedResult = {
      id: mockFieldId,
      update: {
        standardOverrides: {
          translations: {
            'fr-FR': {
              label: null,
            },
          },
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });

  it('should handle multiple updates together', async () => {
    const instance: UpdateOneInputType<UpdateFieldInputForTest> = {
      id: mockFieldId,
      update: {
        isActive: false,
        isLabelSyncedWithName: false,
        label: 'New Label',
        icon: 'IconStar',
        description: 'New Description',
      },
    };

    const mockField: Partial<FieldMetadataEntity> = {
      id: mockFieldId,
      isCustom: false,
      isActive: true,
      isLabelSyncedWithName: false,
      label: 'Default Label',
      icon: 'IconCircle',
      description: 'Default Description',
    };

    jest
      .spyOn(fieldMetadataService, 'findOneWithinWorkspace')
      .mockResolvedValue(mockField as FieldMetadataEntity);

    const result = await hook.run(
      instance as UpdateOneInputType<UpdateFieldInput>,
      {
        workspaceId: mockWorkspaceId,
        locale: undefined,
      },
    );

    const expectedResult = {
      id: mockFieldId,
      update: {
        isActive: false,
        isLabelSyncedWithName: false,
        standardOverrides: {
          label: 'New Label',
          icon: 'IconStar',
          description: 'New Description',
        },
      },
    };

    expect(result).toEqual(expectedResult);
  });
});
