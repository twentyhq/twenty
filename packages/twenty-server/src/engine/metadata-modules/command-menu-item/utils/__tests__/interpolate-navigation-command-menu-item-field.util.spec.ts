import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { interpolateNavigationCommandMenuItemField } from 'src/engine/metadata-modules/command-menu-item/utils/interpolate-navigation-command-menu-item-field.util';
import {
  NAVIGATION_INTERPOLATED_ICON,
  NAVIGATION_INTERPOLATED_LABEL,
  NAVIGATION_INTERPOLATED_SHORT_LABEL,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';

const mockI18nInstance = {
  _: (messageId: string) => messageId,
};

const buildI18nContext = () => ({
  locale: undefined,
  i18nInstance: mockI18nInstance,
  isStandardApp: true,
  applicationCatalog: undefined,
});

const mockObjectMetadata = {
  labelPlural: 'People',
  icon: 'IconUser',
  overrides: undefined,
};

const baseCommandMenuItem = {
  engineComponentKey: EngineComponentKey.NAVIGATION,
  label: NAVIGATION_INTERPOLATED_LABEL,
  shortLabel: NAVIGATION_INTERPOLATED_SHORT_LABEL,
  icon: NAVIGATION_INTERPOLATED_ICON,
  position: 1,
  isPinned: false,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
  payload: { objectMetadataItemId: 'obj-id-1' },
  workspaceId: 'ws-id-1',
  isActive: true,
  isSystemSideEffect: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('interpolateNavigationCommandMenuItemField', () => {
  it('should resolve label template for NAVIGATION items', () => {
    const result = interpolateNavigationCommandMenuItemField({
      commandMenuItem: baseCommandMenuItem,
      resolvedValue: baseCommandMenuItem.label,
      objectMetadata: mockObjectMetadata,
      objectMetadataI18nContext: buildI18nContext(),
    });

    expect(result).toBe('Go to People');
  });

  it('should resolve shortLabel template for NAVIGATION items', () => {
    const result = interpolateNavigationCommandMenuItemField({
      commandMenuItem: baseCommandMenuItem,
      resolvedValue: baseCommandMenuItem.shortLabel,
      objectMetadata: mockObjectMetadata,
      objectMetadataI18nContext: buildI18nContext(),
    });

    expect(result).toBe('People');
  });

  it('should resolve icon template for NAVIGATION items', () => {
    const result = interpolateNavigationCommandMenuItemField({
      commandMenuItem: baseCommandMenuItem,
      resolvedValue: baseCommandMenuItem.icon,
      objectMetadata: mockObjectMetadata,
      objectMetadataI18nContext: buildI18nContext(),
    });

    expect(result).toBe('IconUser');
  });

  it('should return raw label for non-NAVIGATION items', () => {
    const nonNavigationItem = {
      ...baseCommandMenuItem,
      engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
      payload: undefined,
      label: 'Create New Record',
    };

    const result = interpolateNavigationCommandMenuItemField({
      commandMenuItem: nonNavigationItem,
      resolvedValue: nonNavigationItem.label,
      objectMetadata: null,
      objectMetadataI18nContext: buildI18nContext(),
    });

    expect(result).toBe('Create New Record');
  });

  it('should return undefined when object metadata is null for a NAVIGATION item', () => {
    const result = interpolateNavigationCommandMenuItemField({
      commandMenuItem: baseCommandMenuItem,
      resolvedValue: baseCommandMenuItem.label,
      objectMetadata: null,
      objectMetadataI18nContext: buildI18nContext(),
    });

    expect(result).toBeUndefined();
  });

  it('should return undefined for undefined shortLabel', () => {
    const itemWithoutShortLabel = {
      ...baseCommandMenuItem,
      shortLabel: undefined,
    };

    const result = interpolateNavigationCommandMenuItemField({
      commandMenuItem: itemWithoutShortLabel,
      resolvedValue: itemWithoutShortLabel.shortLabel,
      objectMetadata: mockObjectMetadata,
      objectMetadataI18nContext: buildI18nContext(),
    });

    expect(result).toBeUndefined();
  });

  it('should resolve label for custom object metadata', () => {
    const customObjectMetadata = {
      ...mockObjectMetadata,
      labelPlural: 'Custom Objects',
      icon: 'IconCustom',
    };

    const result = interpolateNavigationCommandMenuItemField({
      commandMenuItem: baseCommandMenuItem,
      resolvedValue: baseCommandMenuItem.label,
      objectMetadata: customObjectMetadata,
      objectMetadataI18nContext: buildI18nContext(),
    });

    expect(result).toBe('Go to Custom Objects');
  });

  it('should resolve icon for custom object metadata', () => {
    const customObjectMetadata = {
      ...mockObjectMetadata,
      icon: 'IconCustom',
    };

    const result = interpolateNavigationCommandMenuItemField({
      commandMenuItem: baseCommandMenuItem,
      resolvedValue: baseCommandMenuItem.icon,
      objectMetadata: customObjectMetadata,
      objectMetadataI18nContext: buildI18nContext(),
    });

    expect(result).toBe('IconCustom');
  });

  it('should return raw value when payload has no objectMetadataItemId', () => {
    const itemWithPathPayload = {
      ...baseCommandMenuItem,
      payload: { path: '/settings/profile' },
    };

    const result = interpolateNavigationCommandMenuItemField({
      commandMenuItem: itemWithPathPayload,
      resolvedValue: itemWithPathPayload.label,
      objectMetadata: null,
      objectMetadataI18nContext: buildI18nContext(),
    });

    expect(result).toBe(NAVIGATION_INTERPOLATED_LABEL);
  });

  it('should return literal label as-is when it has no template variables', () => {
    const itemWithLiteralLabel = {
      ...baseCommandMenuItem,
      label: 'Go to People',
    };

    const result = interpolateNavigationCommandMenuItemField({
      commandMenuItem: itemWithLiteralLabel,
      resolvedValue: itemWithLiteralLabel.label,
      objectMetadata: mockObjectMetadata,
      objectMetadataI18nContext: buildI18nContext(),
    });

    expect(result).toBe('Go to People');
  });
});
