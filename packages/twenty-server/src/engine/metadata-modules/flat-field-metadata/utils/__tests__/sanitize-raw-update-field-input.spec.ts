import {
  DateDisplayFormat,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { FieldMetadataException } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { type UpdateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { sanitizeRawUpdateFieldInput } from 'src/engine/metadata-modules/flat-field-metadata/utils/sanitize-raw-update-field-input';

const buildFlatFieldMetadata = (
  overrides: Partial<FlatFieldMetadata>,
): FlatFieldMetadata =>
  ({
    id: 'field-id',
    universalIdentifier: 'field-uid',
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectMetadataId: 'object-id',
    objectMetadataUniversalIdentifier: 'object-uid',
    type: FieldMetadataType.DATE_TIME,
    name: 'createdAt',
    label: 'Creation date',
    description: '',
    icon: 'IconCalendar',
    isActive: true,
    isSystem: true,
    isSystemSideEffect: true,
    isNullable: false,
    isUnique: false,
    isSearchable: false,
    isAuditLogged: true,
    isUIEditable: false,
    isLabelSyncedWithName: false,
    writability: 'OPEN',
    overrides: null,
    defaultValue: 'now',
    settings: { displayFormat: DateDisplayFormat.RELATIVE },
    options: null,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    morphId: null,
    viewFieldIds: [],
    viewFilterIds: [],
    fieldPermissionIds: [],
    kanbanAggregateOperationViewIds: [],
    calendarViewIds: [],
    calendarEndViewIds: [],
    mainGroupByFieldMetadataViewIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    applicationId: 'application-id',
    workspaceId: 'workspace-id',
    relationTargetObjectMetadataUniversalIdentifier: null,
    relationTargetFieldMetadataUniversalIdentifier: null,
    viewFilterUniversalIdentifiers: [],
    viewFieldUniversalIdentifiers: [],
    fieldPermissionUniversalIdentifiers: [],
    kanbanAggregateOperationViewUniversalIdentifiers: [],
    calendarViewUniversalIdentifiers: [],
    calendarEndViewUniversalIdentifiers: [],
    mainGroupByFieldMetadataViewUniversalIdentifiers: [],
    viewSortIds: [],
    viewSortUniversalIdentifiers: [],
    searchFieldMetadataIds: [],
    searchFieldMetadataUniversalIdentifiers: [],
    universalSettings: { displayFormat: DateDisplayFormat.RELATIVE },
    ...overrides,
  }) as FlatFieldMetadata;

const buildUpdateInput = (
  overrides: Partial<UpdateFieldInput>,
): UpdateFieldInput =>
  ({
    id: 'field-id',
    workspaceId: 'workspace-id',
    ...overrides,
  }) as UpdateFieldInput;

describe('sanitizeRawUpdateFieldInput', () => {
  describe('system side-effect DATE_TIME field (e.g. createdAt)', () => {
    it('should allow updating settings.displayFormat', () => {
      const result = sanitizeRawUpdateFieldInput({
        existingFlatFieldMetadata: buildFlatFieldMetadata({
          type: FieldMetadataType.DATE_TIME,
          name: 'createdAt',
        }),
        rawUpdateFieldInput: buildUpdateInput({
          settings: { displayFormat: DateDisplayFormat.USER_SETTINGS },
        }),
        isSystemBuild: false,
      });

      expect(result.updatedEditableFieldProperties.settings).toEqual({
        displayFormat: DateDisplayFormat.USER_SETTINGS,
      });
    });

    it('should allow updating settings.customUnicodeDateFormat alongside displayFormat', () => {
      const result = sanitizeRawUpdateFieldInput({
        existingFlatFieldMetadata: buildFlatFieldMetadata({
          type: FieldMetadataType.DATE_TIME,
          name: 'updatedAt',
        }),
        rawUpdateFieldInput: buildUpdateInput({
          settings: {
            displayFormat: DateDisplayFormat.CUSTOM,
            customUnicodeDateFormat: 'dd/MM/yyyy HH:mm',
          },
        }),
        isSystemBuild: false,
      });

      expect(result.updatedEditableFieldProperties.settings).toEqual({
        displayFormat: DateDisplayFormat.CUSTOM,
        customUnicodeDateFormat: 'dd/MM/yyyy HH:mm',
      });
    });

    it('should allow updating settings on DATE (not DATE_TIME) system side-effect fields', () => {
      const result = sanitizeRawUpdateFieldInput({
        existingFlatFieldMetadata: buildFlatFieldMetadata({
          type: FieldMetadataType.DATE,
          name: 'birthdate',
        }),
        rawUpdateFieldInput: buildUpdateInput({
          settings: { displayFormat: DateDisplayFormat.USER_SETTINGS },
        }),
        isSystemBuild: false,
      });

      expect(result.updatedEditableFieldProperties.settings).toEqual({
        displayFormat: DateDisplayFormat.USER_SETTINGS,
      });
    });

    it('should merge a partial update with the existing settings instead of overwriting them', () => {
      const result = sanitizeRawUpdateFieldInput({
        existingFlatFieldMetadata: buildFlatFieldMetadata({
          type: FieldMetadataType.DATE_TIME,
          name: 'createdAt',
          settings: {
            displayFormat: DateDisplayFormat.CUSTOM,
            customUnicodeDateFormat: 'dd/MM/yyyy HH:mm',
          },
        }),
        rawUpdateFieldInput: buildUpdateInput({
          settings: { displayFormat: DateDisplayFormat.USER_SETTINGS },
        }),
        isSystemBuild: false,
      });

      expect(result.updatedEditableFieldProperties.settings).toEqual({
        displayFormat: DateDisplayFormat.USER_SETTINGS,
        customUnicodeDateFormat: 'dd/MM/yyyy HH:mm',
      });
    });

    it('should drop the settings update entirely when it matches the existing value', () => {
      const result = sanitizeRawUpdateFieldInput({
        existingFlatFieldMetadata: buildFlatFieldMetadata({
          type: FieldMetadataType.DATE_TIME,
          name: 'createdAt',
        }),
        rawUpdateFieldInput: buildUpdateInput({
          settings: { displayFormat: DateDisplayFormat.RELATIVE },
        }),
        isSystemBuild: false,
      });

      expect(
        result.updatedEditableFieldProperties.settings,
      ).toBeUndefined();
      expect(result.updatedEditableFieldProperties).not.toHaveProperty(
        'settings',
      );
    });

    it('should clear customUnicodeDateFormat when set to null', () => {
      const result = sanitizeRawUpdateFieldInput({
        existingFlatFieldMetadata: buildFlatFieldMetadata({
          type: FieldMetadataType.DATE_TIME,
          name: 'createdAt',
          settings: {
            displayFormat: DateDisplayFormat.CUSTOM,
            customUnicodeDateFormat: 'dd/MM/yyyy',
          },
        }),
        rawUpdateFieldInput: buildUpdateInput({
          settings: { customUnicodeDateFormat: null as unknown as string },
        }),
        isSystemBuild: false,
      });

      expect(result.updatedEditableFieldProperties.settings).toEqual({
        displayFormat: DateDisplayFormat.CUSTOM,
      });
    });

    it('should reject settings with unknown keys', () => {
      expect(() =>
        sanitizeRawUpdateFieldInput({
          existingFlatFieldMetadata: buildFlatFieldMetadata({
            type: FieldMetadataType.DATE_TIME,
            name: 'createdAt',
          }),
          rawUpdateFieldInput: buildUpdateInput({
            settings: {
              displayFormat: DateDisplayFormat.USER_SETTINGS,
              relationType: RelationType.ONE_TO_MANY,
            },
          }),
          isSystemBuild: false,
        }),
      ).toThrow(FieldMetadataException);
    });

    it('should reject an unknown displayFormat value', () => {
      expect(() =>
        sanitizeRawUpdateFieldInput({
          existingFlatFieldMetadata: buildFlatFieldMetadata({
            type: FieldMetadataType.DATE_TIME,
            name: 'createdAt',
          }),
          rawUpdateFieldInput: buildUpdateInput({
            settings: {
              displayFormat: 'NOPE' as unknown as DateDisplayFormat,
            },
          }),
          isSystemBuild: false,
        }),
      ).toThrow(FieldMetadataException);
    });

    it('should reject an invalid customUnicodeDateFormat value', () => {
      expect(() =>
        sanitizeRawUpdateFieldInput({
          existingFlatFieldMetadata: buildFlatFieldMetadata({
            type: FieldMetadataType.DATE_TIME,
            name: 'createdAt',
          }),
          rawUpdateFieldInput: buildUpdateInput({
            settings: {
              displayFormat: DateDisplayFormat.CUSTOM,
              customUnicodeDateFormat: 'this is not a format',
            },
          }),
          isSystemBuild: false,
        }),
      ).toThrow(FieldMetadataException);
    });

    it('should reject a non-string customUnicodeDateFormat value', () => {
      expect(() =>
        sanitizeRawUpdateFieldInput({
          existingFlatFieldMetadata: buildFlatFieldMetadata({
            type: FieldMetadataType.DATE_TIME,
            name: 'createdAt',
          }),
          rawUpdateFieldInput: buildUpdateInput({
            settings: {
              displayFormat: DateDisplayFormat.CUSTOM,
              customUnicodeDateFormat: 42 as unknown as string,
            },
          }),
          isSystemBuild: false,
        }),
      ).toThrow(FieldMetadataException);
    });

    it('should still allow updating isActive', () => {
      const result = sanitizeRawUpdateFieldInput({
        existingFlatFieldMetadata: buildFlatFieldMetadata({
          type: FieldMetadataType.DATE_TIME,
          name: 'createdAt',
        }),
        rawUpdateFieldInput: buildUpdateInput({ isActive: false }),
        isSystemBuild: false,
      });

      expect(result.updatedEditableFieldProperties.isActive).toBe(false);
    });

    it('should still reject non-display property updates like label', () => {
      expect(() =>
        sanitizeRawUpdateFieldInput({
          existingFlatFieldMetadata: buildFlatFieldMetadata({
            type: FieldMetadataType.DATE_TIME,
            name: 'createdAt',
          }),
          rawUpdateFieldInput: buildUpdateInput({ label: 'New Label' }),
          isSystemBuild: false,
        }),
      ).toThrow(FieldMetadataException);
    });
  });

  describe('system side-effect non-date field (e.g. position)', () => {
    it('should reject settings updates', () => {
      expect(() =>
        sanitizeRawUpdateFieldInput({
          existingFlatFieldMetadata: buildFlatFieldMetadata({
            type: FieldMetadataType.POSITION,
            name: 'position',
            settings: null,
          }),
          rawUpdateFieldInput: buildUpdateInput({
            settings: { displayFormat: DateDisplayFormat.USER_SETTINGS },
          }),
          isSystemBuild: false,
        }),
      ).toThrow(FieldMetadataException);
    });

    it('should still allow updating isActive', () => {
      const result = sanitizeRawUpdateFieldInput({
        existingFlatFieldMetadata: buildFlatFieldMetadata({
          type: FieldMetadataType.POSITION,
          name: 'position',
          settings: null,
        }),
        rawUpdateFieldInput: buildUpdateInput({ isActive: false }),
        isSystemBuild: false,
      });

      expect(result.updatedEditableFieldProperties.isActive).toBe(false);
    });
  });

  describe('non-system-side-effect fields', () => {
    it('should not enforce the system side-effect rules on a regular field', () => {
      const result = sanitizeRawUpdateFieldInput({
        existingFlatFieldMetadata: buildFlatFieldMetadata({
          type: FieldMetadataType.TEXT,
          name: 'name',
          isSystem: false,
          isSystemSideEffect: false,
        }),
        rawUpdateFieldInput: buildUpdateInput({ label: 'New label' }),
        isSystemBuild: false,
      });

      // Label is overridable for standard fields, so it lands in overrides
      expect(result.overrides).toEqual({ label: 'New label' });
      expect(result.updatedEditableFieldProperties).not.toHaveProperty('label');
    });
  });

  describe('system build', () => {
    it('should not enforce the system side-effect rules during a system build', () => {
      const result = sanitizeRawUpdateFieldInput({
        existingFlatFieldMetadata: buildFlatFieldMetadata({
          type: FieldMetadataType.DATE_TIME,
          name: 'createdAt',
        }),
        rawUpdateFieldInput: buildUpdateInput({
          settings: {
            displayFormat: DateDisplayFormat.RELATIVE,
            relationType: RelationType.ONE_TO_MANY,
          },
        }),
        isSystemBuild: true,
      });

      expect(result.updatedEditableFieldProperties.settings).toEqual({
        displayFormat: DateDisplayFormat.RELATIVE,
        relationType: RelationType.ONE_TO_MANY,
      });
    });
  });
});