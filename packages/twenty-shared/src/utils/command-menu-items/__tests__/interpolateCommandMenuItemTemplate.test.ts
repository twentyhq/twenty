import { ContextStorePageType, type CommandMenuContextApi } from '@/types';
import { interpolateCommandMenuItemTemplate } from '../interpolateCommandMenuItemTemplate';

const buildContext = (
  overrides: Partial<CommandMenuContextApi> = {},
): CommandMenuContextApi => ({
  pageType: ContextStorePageType.Index,
  isInSidePanel: false,
  isDashboardPageLayoutInEditMode: false,
  isLayoutCustomizationModeEnabled: false,
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
  objectMetadataLabel: '',
  ...overrides,
});

describe('interpolateCommandMenuItemTemplate', () => {
  describe('sequential invocations (global regex lastIndex)', () => {
    it('should interpolate correctly when called multiple times in sequence', () => {
      const context = buildContext({
        numberOfSelectedRecords: 2,
        objectMetadataItem: { labelPlural: 'people' },
      });

      expect(
        interpolateCommandMenuItemTemplate({
          label: 'First: ${numberOfSelectedRecords}',
          context,
        }),
      ).toBe('First: 2');

      expect(
        interpolateCommandMenuItemTemplate({
          label: 'Second: ${objectMetadataItem.labelPlural}',
          context,
        }),
      ).toBe('Second: people');
    });
  });

  describe('plain strings without template variables', () => {
    it('should return the label unchanged when no template variables are present', () => {
      const context = buildContext();

      expect(
        interpolateCommandMenuItemTemplate({ label: 'Delete', context }),
      ).toBe('Delete');
    });

    it('should return null when label is null', () => {
      const context = buildContext();

      expect(
        interpolateCommandMenuItemTemplate({ label: null, context }),
      ).toBeNull();
    });

    it('should return null when label is undefined', () => {
      const context = buildContext();

      expect(
        interpolateCommandMenuItemTemplate({ label: undefined, context }),
      ).toBeNull();
    });

    it('should return an empty string for an empty label', () => {
      const context = buildContext();

      expect(interpolateCommandMenuItemTemplate({ label: '', context })).toBe(
        '',
      );
    });
  });

  describe('simple template variable interpolation', () => {
    it('should interpolate a top-level context property', () => {
      const context = buildContext({ numberOfSelectedRecords: 5 });

      expect(
        interpolateCommandMenuItemTemplate({
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
        interpolateCommandMenuItemTemplate({
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
        interpolateCommandMenuItemTemplate({
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
        interpolateCommandMenuItemTemplate({
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
        interpolateCommandMenuItemTemplate({
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
        interpolateCommandMenuItemTemplate({
          label: 'New ${objectMetadataItem.labelSingular}',
          context,
        }),
      ).toBe('New ');
    });

    it('should return empty string for empty objectMetadataItem', () => {
      const context = buildContext();

      expect(
        interpolateCommandMenuItemTemplate({
          label: 'Create new ${objectMetadataItem.labelSingular}',
          context,
        }),
      ).toBe('Create new ');
    });
  });

  describe('unresolvable property paths', () => {
    it('should return empty string for a path that cannot be resolved', () => {
      const context = buildContext();

      expect(
        interpolateCommandMenuItemTemplate({
          label: 'Label ${nonExistent.deep.path}',
          context,
        }),
      ).toBe('Label ');
    });

    it('should not resolve inherited Object.prototype members', () => {
      const context = buildContext();

      expect(
        interpolateCommandMenuItemTemplate({
          label: 'Val: ${toString}',
          context,
        }),
      ).toBe('Val: ');

      expect(
        interpolateCommandMenuItemTemplate({
          label: 'Val: ${objectMetadataItem.hasOwnProperty}',
          context,
        }),
      ).toBe('Val: ');
    });
  });

  describe('boolean context values', () => {
    it('should stringify boolean values', () => {
      const context = buildContext({ isInSidePanel: true });

      expect(
        interpolateCommandMenuItemTemplate({
          label: 'Side panel: ${isInSidePanel}',
          context,
        }),
      ).toBe('Side panel: true');
    });

    it('should pass through string values as-is without forced lowercasing', () => {
      const context = buildContext({
        objectMetadataItem: { labelSingular: 'Person' },
      });

      expect(
        interpolateCommandMenuItemTemplate({
          label: 'Create new ${objectMetadataItem.labelSingular}',
          context,
        }),
      ).toBe('Create new Person');
    });
  });

  describe('capitalize transform', () => {
    it('should capitalize the first character of a resolved value', () => {
      const context = buildContext({
        objectMetadataItem: { labelSingular: 'person' },
      });

      expect(
        interpolateCommandMenuItemTemplate({
          label: '${capitalize(objectMetadataItem.labelSingular)} details',
          context,
        }),
      ).toBe('Person details');
    });

    it('should capitalize a mixed-case value', () => {
      const context = buildContext({
        objectMetadataItem: { labelPlural: 'companyRecords' },
      });

      expect(
        interpolateCommandMenuItemTemplate({
          label: '${capitalize(objectMetadataItem.labelPlural)} selected',
          context,
        }),
      ).toBe('CompanyRecords selected');
    });

    it('should return empty string when the nested property is undefined', () => {
      const context = buildContext({
        objectMetadataItem: {},
      });

      expect(
        interpolateCommandMenuItemTemplate({
          label: '${capitalize(objectMetadataItem.labelSingular)} details',
          context,
        }),
      ).toBe(' details');
    });
  });

  describe('lowercase transform', () => {
    it('should lowercase the resolved value', () => {
      const context = buildContext({
        objectMetadataItem: { labelSingular: 'Person' },
      });

      expect(
        interpolateCommandMenuItemTemplate({
          label: 'Create ${lowercase(objectMetadataItem.labelSingular)}',
          context,
        }),
      ).toBe('Create person');
    });

    it('should lowercase all characters', () => {
      const context = buildContext({
        objectMetadataItem: { labelPlural: 'People' },
      });

      expect(
        interpolateCommandMenuItemTemplate({
          label: 'Delete ${lowercase(objectMetadataItem.labelPlural)}',
          context,
        }),
      ).toBe('Delete people');
    });
  });

  describe('icon interpolation', () => {
    it('should interpolate objectMetadataItem.icon', () => {
      const context = buildContext({
        objectMetadataItem: { icon: 'IconBuilding' },
      });

      expect(
        interpolateCommandMenuItemTemplate({
          label: '${objectMetadataItem.icon}',
          context,
        }),
      ).toBe('IconBuilding');
    });

    it('should return static icon unchanged when no template variable present', () => {
      const context = buildContext();

      expect(
        interpolateCommandMenuItemTemplate({
          label: 'IconTrash',
          context,
        }),
      ).toBe('IconTrash');
    });
  });

  describe('objectMetadataLabel interpolation', () => {
    it('should resolve singular label with capitalize transform', () => {
      const context = buildContext({
        objectMetadataLabel: 'person',
      });

      expect(
        interpolateCommandMenuItemTemplate({
          label: 'Delete ${capitalize(objectMetadataLabel)}',
          context,
        }),
      ).toBe('Delete Person');
    });

    it('should resolve plural label with capitalize transform', () => {
      const context = buildContext({
        objectMetadataLabel: 'companies',
      });

      expect(
        interpolateCommandMenuItemTemplate({
          label: 'Export ${capitalize(objectMetadataLabel)}',
          context,
        }),
      ).toBe('Export Companies');
    });

    it('should resolve objectMetadataLabel without transform', () => {
      const context = buildContext({
        objectMetadataLabel: 'people',
      });

      expect(
        interpolateCommandMenuItemTemplate({
          label: '${objectMetadataLabel} selected',
          context,
        }),
      ).toBe('people selected');
    });

    it('should resolve objectMetadataLabel with lowercase transform', () => {
      const context = buildContext({
        objectMetadataLabel: 'Person',
      });

      expect(
        interpolateCommandMenuItemTemplate({
          label: 'Create ${lowercase(objectMetadataLabel)}',
          context,
        }),
      ).toBe('Create person');
    });

    it('should return empty segment when objectMetadataLabel is empty', () => {
      const context = buildContext({
        objectMetadataLabel: '',
      });

      expect(
        interpolateCommandMenuItemTemplate({
          label: 'Delete ${capitalize(objectMetadataLabel)}',
          context,
        }),
      ).toBe('Delete ');
    });
  });
});
