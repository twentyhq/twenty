import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { EnumColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/enum-column-action.factory';
import { WorkspaceMigrationColumnActionType } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationException } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.exception';

describe('EnumColumnActionFactory', () => {
  let factory: EnumColumnActionFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnumColumnActionFactory],
    }).compile();

    factory = module.get<EnumColumnActionFactory>(EnumColumnActionFactory);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  describe('handleCreateAction', () => {
    it('should create column action for SELECT field', () => {
      // Arrange
      const fieldMetadata: FieldMetadataInterface<FieldMetadataType.SELECT> = {
        id: 'select-field-id',
        type: FieldMetadataType.SELECT,
        name: 'statusField',
        objectMetadataId: 'object-id',
        isNullable: true,
        options: [
          {
            id: 'option1-id',
            value: 'OPEN',
            label: 'Open',
            position: 0,
            color: 'green',
          },
          {
            id: 'option2-id',
            value: 'CLOSED',
            label: 'Closed',
            position: 1,
            color: 'red',
          },
        ],
        defaultValue: "'OPEN'",
        label: 'Status',
      };

      // Act
      const result = (factory as any).handleCreateAction(fieldMetadata, {});

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].action).toEqual(
        WorkspaceMigrationColumnActionType.CREATE,
      );
      expect(result[0].columnName).toEqual('statusField');
      expect(result[0].enum).toEqual(['OPEN', 'CLOSED']);
      expect(result[0].isArray).toBe(false);
      expect(result[0].isNullable).toBe(true);
      expect(result[0].isUnique).toBe(false);
    });

    it('should create column action for MULTI_SELECT field', () => {
      // Arrange
      const fieldMetadata: FieldMetadataInterface<FieldMetadataType.MULTI_SELECT> =
        {
          id: 'multi-select-field-id',
          type: FieldMetadataType.MULTI_SELECT,
          name: 'tagsField',
          objectMetadataId: 'object-id',
          isNullable: true,
          options: [
            {
              id: 'option1-id',
              value: 'URGENT',
              label: 'Urgent',
              position: 0,
              color: 'red',
            },
            {
              id: 'option2-id',
              value: 'NEW',
              label: 'New',
              position: 1,
              color: 'green',
            },
          ],
          defaultValue: null,
          label: 'Tags',
        };

      // Act
      const result = (factory as any).handleCreateAction(fieldMetadata, {});

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].action).toEqual(
        WorkspaceMigrationColumnActionType.CREATE,
      );
      expect(result[0].columnName).toEqual('tagsField');
      expect(result[0].enum).toEqual(['URGENT', 'NEW']);
      expect(result[0].isArray).toBe(true);
      expect(result[0].isNullable).toBe(true);
      expect(result[0].isUnique).toBe(false);
      expect(result[0].defaultValue).toBeNull();
    });

    it('should use options defaultValue when field defaultValue is null', () => {
      // Arrange
      const fieldMetadata: FieldMetadataInterface<FieldMetadataType.SELECT> = {
        id: 'select-field-id',
        type: FieldMetadataType.SELECT,
        name: 'priorityField',
        objectMetadataId: 'object-id',
        isNullable: true,
        options: [
          {
            id: 'option1-id',
            value: 'HIGH',
            label: 'High',
            position: 0,
            color: 'red',
          },
          {
            id: 'option2-id',
            value: 'MEDIUM',
            label: 'Medium',
            position: 1,
            color: 'orange',
          },
        ],
        defaultValue: null,
        label: 'Priority',
      };
      const options = { defaultValue: "'HIGH'" };

      // Act
      const result = (factory as any).handleCreateAction(
        fieldMetadata,
        options,
      );

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].columnName).toEqual('priorityField');
      expect(result[0].defaultValue).not.toBeNull();
    });
  });

  describe('validateDefaultValueOrFallbackToNullIfNullable', () => {
    it('should return defaultValue if it exists in enumOptions', () => {
      // Arrange
      const defaultValue = "'VALID_OPTION'";
      const enumOptions = ['VALID_OPTION', 'ANOTHER_OPTION'];
      const isNullable = true;

      // Act
      const result = (
        factory as any
      ).validateDefaultValueOrFallbackToNullIfNullable(
        defaultValue,
        enumOptions,
        isNullable,
      );

      // Assert
      expect(result).toEqual(defaultValue);
    });

    it('should handle quoted string values correctly', () => {
      // Arrange
      const defaultValue = "'VALID_OPTION'";
      const enumOptions = ['VALID_OPTION', 'ANOTHER_OPTION'];
      const isNullable = true;

      // Act
      const result = (
        factory as any
      ).validateDefaultValueOrFallbackToNullIfNullable(
        defaultValue,
        enumOptions,
        isNullable,
      );

      // Assert
      expect(result).toEqual(defaultValue);
    });

    it('should return null if defaultValue is not in enumOptions and field is nullable', () => {
      // Arrange
      const defaultValue = "'INVALID_OPTION'";
      const enumOptions = ['VALID_OPTION', 'ANOTHER_OPTION'];
      const isNullable = true;

      // Act
      const result = (
        factory as any
      ).validateDefaultValueOrFallbackToNullIfNullable(
        defaultValue,
        enumOptions,
        isNullable,
      );

      // Assert
      expect(result).toBeNull();
    });

    it('should throw exception if defaultValue is not in enumOptions and field is not nullable', () => {
      // Arrange
      const defaultValue = "'INVALID_OPTION'";
      const enumOptions = ['VALID_OPTION', 'ANOTHER_OPTION'];
      const isNullable = false;

      // Act & Assert
      expect(() => {
        (factory as any).validateDefaultValueOrFallbackToNullIfNullable(
          defaultValue,
          enumOptions,
          isNullable,
        );
      }).toThrow(WorkspaceMigrationException);
    });
  });

  describe('handleAlterAction', () => {
    it('should handle altering a SELECT field correctly', () => {
      // Arrange
      const currentFieldMetadata: FieldMetadataInterface<FieldMetadataType.SELECT> =
        {
          id: 'select-field-id',
          type: FieldMetadataType.SELECT,
          name: 'statusField',
          objectMetadataId: 'object-id',
          isNullable: true,
          options: [
            {
              id: 'option1-id',
              value: 'OPEN',
              label: 'Open',
              position: 0,
              color: 'green',
            },
            {
              id: 'option2-id',
              value: 'CLOSED',
              label: 'Closed',
              position: 1,
              color: 'red',
            },
          ],
          defaultValue: "'OPEN'",
          label: 'Status',
        };

      const alteredFieldMetadata: FieldMetadataInterface<FieldMetadataType.SELECT> =
        {
          id: 'select-field-id',
          type: FieldMetadataType.SELECT,
          name: 'statusField',
          objectMetadataId: 'object-id',
          isNullable: false,
          options: [
            {
              id: 'option1-id',
              value: 'OPEN_RENAMED',
              label: 'Open Renamed',
              position: 0,
              color: 'blue',
            }, // Value changed
            {
              id: 'option2-id',
              value: 'CLOSED',
              label: 'Closed',
              position: 1,
              color: 'red',
            },
            {
              id: 'option3-id',
              value: 'PENDING',
              label: 'Pending',
              position: 2,
              color: 'orange',
            }, // New option
          ],
          defaultValue: "'OPEN_RENAMED'",
          label: 'Status',
        };

      // Act
      const result = (factory as any).handleAlterAction(
        currentFieldMetadata,
        alteredFieldMetadata,
        {},
      );

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].action).toEqual(
        WorkspaceMigrationColumnActionType.ALTER,
      );
      expect(result[0].currentColumnDefinition.columnName).toEqual(
        'statusField',
      );
      expect(result[0].currentColumnDefinition.enum).toEqual([
        'OPEN',
        'CLOSED',
      ]);
      expect(result[0].currentColumnDefinition.isNullable).toBe(true);

      expect(result[0].alteredColumnDefinition.columnName).toEqual(
        'statusField',
      );
      expect(result[0].alteredColumnDefinition.enum).toContainEqual({
        from: 'OPEN',
        to: 'OPEN_RENAMED',
      });
      expect(result[0].alteredColumnDefinition.enum).toContain('CLOSED');
      expect(result[0].alteredColumnDefinition.enum).toContain('PENDING');
      expect(result[0].alteredColumnDefinition.isNullable).toBe(false);
    });

    it('should throw an exception when column names are not found', () => {
      // Arrange
      const currentFieldMetadata = {
        id: 'field-id',
        type: FieldMetadataType.SELECT,
        label: 'Label',
      } as FieldMetadataInterface<FieldMetadataType.SELECT>;

      const alteredFieldMetadata = {
        id: 'field-id',
        type: FieldMetadataType.SELECT,
        label: 'Label',
      } as FieldMetadataInterface<FieldMetadataType.SELECT>;

      // Spy on logger.error
      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');

      // Act & Assert
      expect(() => {
        (factory as any).handleAlterAction(
          currentFieldMetadata,
          alteredFieldMetadata,
          {},
        );
      }).toThrow(WorkspaceMigrationException);

      expect(loggerErrorSpy).toHaveBeenCalled();
    });
  });
});
