import {
  CommandMenuContextApiPageType,
  type CommandMenuContextApi,
} from '@/types';
import { interpolateCommandMenuItemLabel } from '../interpolateCommandMenuItemLabel';

const buildContext = (
  overrides: Partial<CommandMenuContextApi> = {},
): CommandMenuContextApi => ({
  pageType: CommandMenuContextApiPageType.INDEX_PAGE,
  isInSidePanel: false,
  isPageInEditMode: false,
  favoriteRecordIds: [],
  isSelectAll: false,
  hasAnySoftDeleteFilterOnView: false,
  numberOfSelectedRecords: 0,
  objectPermissions: {
    objectMetadataId: '',
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: false,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  },
  selectedRecords: [],
  featureFlags: {},
  targetObjectReadPermissions: {},
  targetObjectWritePermissions: {},
  objectMetadataItem: {},
  ...overrides,
});

describe('interpolateCommandMenuItemLabel', () => {
  describe('plain strings without template variables', () => {
    it('should return the label unchanged when no template variables are present', () => {
      const context = buildContext();

      expect(
        interpolateCommandMenuItemLabel({ label: 'Delete', context }),
      ).toBe('Delete');
    });

    it('should return null when label is null', () => {
      const context = buildContext();

      expect(
        interpolateCommandMenuItemLabel({ label: null, context }),
      ).toBeNull();
    });

    it('should return null when label is undefined', () => {
      const context = buildContext();

      expect(
        interpolateCommandMenuItemLabel({ label: undefined, context }),
      ).toBeNull();
    });

    it('should return an empty string for an empty label', () => {
      const context = buildContext();

      expect(
        interpolateCommandMenuItemLabel({ label: '', context }),
      ).toBe('');
    });
  });

  describe('simple template variable interpolation', () => {
    it('should interpolate a top-level context property', () => {
      const context = buildContext({ numberOfSelectedRecords: 5 });

      expect(
        interpolateCommandMenuItemLabel({
          label: 'Selected: ${numberOfSelectedRecords}',
          context,
        }),
      ).toBe('Selected: 5');
    });

    it('should interpolate objectMetadataItem.labelSingular', () => {
      const context = buildContext({
        objectMetadataItem: { labelSingular: 'person' },
      });

      expect(
        interpolateCommandMenuItemLabel({
          label: 'Create new ${objectMetadataItem.labelSingular}',
          context,
        }),
      ).toBe('Create new person');
    });

    it('should interpolate objectMetadataItem.labelPlural', () => {
      const context = buildContext({
        objectMetadataItem: { labelPlural: 'companies' },
      });

      expect(
        interpolateCommandMenuItemLabel({
          label: 'Delete ${objectMetadataItem.labelPlural}',
          context,
        }),
      ).toBe('Delete companies');
    });
  });

  describe('multiple template variables', () => {
    it('should interpolate multiple variables in one label', () => {
      const context = buildContext({
        numberOfSelectedRecords: 3,
        objectMetadataItem: { labelPlural: 'people' },
      });

      expect(
        interpolateCommandMenuItemLabel({
          label:
            '${numberOfSelectedRecords} ${objectMetadataItem.labelPlural} selected',
          context,
        }),
      ).toBe('3 people selected');
    });
  });

  describe('nested property access', () => {
    it('should resolve deeply nested properties', () => {
      const context = buildContext({
        objectMetadataItem: {
          labelSingular: 'opportunity',
          nameSingular: 'opportunity',
        },
      });

      expect(
        interpolateCommandMenuItemLabel({
          label: 'New ${objectMetadataItem.nameSingular}',
          context,
        }),
      ).toBe('New opportunity');
    });
  });

  describe('missing context values', () => {
    it('should return empty string for undefined nested property', () => {
      const context = buildContext({
        objectMetadataItem: {},
      });

      expect(
        interpolateCommandMenuItemLabel({
          label: 'New ${objectMetadataItem.labelSingular}',
          context,
        }),
      ).toBe('New ');
    });

    it('should return empty string for empty objectMetadataItem', () => {
      const context = buildContext();

      expect(
        interpolateCommandMenuItemLabel({
          label: 'Create new ${objectMetadataItem.labelSingular}',
          context,
        }),
      ).toBe('Create new ');
    });
  });

  describe('invalid expressions', () => {
    it('should preserve the raw template for invalid syntax', () => {
      const context = buildContext();

      expect(
        interpolateCommandMenuItemLabel({
          label: 'Label ${!!!invalid...syntax}',
          context,
        }),
      ).toBe('Label ${!!!invalid...syntax}');
    });
  });

  describe('boolean context values', () => {
    it('should stringify boolean values', () => {
      const context = buildContext({ isInSidePanel: true });

      expect(
        interpolateCommandMenuItemLabel({
          label: 'Side panel: ${isInSidePanel}',
          context,
        }),
      ).toBe('Side panel: true');
    });
  });
});
