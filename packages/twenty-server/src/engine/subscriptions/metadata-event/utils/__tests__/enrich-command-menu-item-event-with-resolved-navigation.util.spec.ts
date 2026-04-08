import { type I18n } from '@lingui/core';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import {
  NAVIGATION_INTERPOLATED_ICON,
  NAVIGATION_INTERPOLATED_LABEL,
  NAVIGATION_INTERPOLATED_SHORT_LABEL,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { enrichCommandMenuItemEventWithResolvedNavigation } from 'src/engine/subscriptions/metadata-event/utils/enrich-command-menu-item-event-with-resolved-navigation.util';

const mockI18nInstance = {
  _: (messageId: string) => messageId,
} as unknown as I18n;

const OBJECT_METADATA_ID = 'obj-id-1';

const makeFlatObjectMetadata = (
  overrides?: Partial<FlatObjectMetadata>,
): FlatObjectMetadata =>
  ({
    id: OBJECT_METADATA_ID,
    universalIdentifier: 'obj-uid-1',
    workspaceId: 'ws-1',
    applicationId: 'app-1',
    labelPlural: 'People',
    labelSingular: 'Person',
    icon: 'IconUser',
    isCustom: false,
    standardOverrides: null,
    ...overrides,
  }) as unknown as FlatObjectMetadata;

const makeFlatObjectMetadataMaps = (
  flatObjectMetadata: FlatObjectMetadata,
): FlatEntityMaps<FlatObjectMetadata> => ({
  byUniversalIdentifier: {
    [flatObjectMetadata.universalIdentifier]: flatObjectMetadata,
  },
  universalIdentifierById: {
    [flatObjectMetadata.id]: flatObjectMetadata.universalIdentifier,
  },
  universalIdentifiersByApplicationId: {},
});

const makeNavigationRecord = (
  overrides?: Partial<FlatCommandMenuItem>,
): FlatCommandMenuItem =>
  ({
    id: 'cmd-id-1',
    engineComponentKey: EngineComponentKey.NAVIGATION,
    label: NAVIGATION_INTERPOLATED_LABEL,
    shortLabel: NAVIGATION_INTERPOLATED_SHORT_LABEL,
    icon: NAVIGATION_INTERPOLATED_ICON,
    payload: { objectMetadataItemId: OBJECT_METADATA_ID },
    position: 1,
    isPinned: false,
    ...overrides,
  }) as unknown as FlatCommandMenuItem;

describe('enrichCommandMenuItemEventWithResolvedNavigation', () => {
  it('should resolve label, shortLabel, and icon templates for NAVIGATION items', () => {
    const flatObjectMetadata = makeFlatObjectMetadata();
    const flatObjectMetadataMaps =
      makeFlatObjectMetadataMaps(flatObjectMetadata);

    const record = makeNavigationRecord();

    const result = enrichCommandMenuItemEventWithResolvedNavigation({
      record,
      flatObjectMetadataMaps,
      locale: SOURCE_LOCALE,
      i18nInstance: mockI18nInstance,
    });

    expect(result.label).toBe('Go to People');
    expect(result.shortLabel).toBe('People');
    expect(result.icon).toBe('IconUser');
  });

  it('should return record unchanged for non-NAVIGATION items', () => {
    const flatObjectMetadata = makeFlatObjectMetadata();
    const flatObjectMetadataMaps =
      makeFlatObjectMetadataMaps(flatObjectMetadata);

    const record = makeNavigationRecord({
      engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
      label: 'Create New Record',
      shortLabel: undefined,
      icon: 'IconPlus',
      payload: undefined,
    });

    const result = enrichCommandMenuItemEventWithResolvedNavigation({
      record,
      flatObjectMetadataMaps,
      locale: SOURCE_LOCALE,
      i18nInstance: mockI18nInstance,
    });

    expect(result).toBe(record);
  });

  it('should return record unchanged when payload has no objectMetadataItemId', () => {
    const flatObjectMetadata = makeFlatObjectMetadata();
    const flatObjectMetadataMaps =
      makeFlatObjectMetadataMaps(flatObjectMetadata);

    const record = makeNavigationRecord({
      payload: { path: '/settings' },
    });

    const result = enrichCommandMenuItemEventWithResolvedNavigation({
      record,
      flatObjectMetadataMaps,
      locale: SOURCE_LOCALE,
      i18nInstance: mockI18nInstance,
    });

    expect(result).toBe(record);
  });

  it('should return record unchanged when object metadata is not found in maps', () => {
    const emptyMaps: FlatEntityMaps<FlatObjectMetadata> = {
      byUniversalIdentifier: {},
      universalIdentifierById: {},
      universalIdentifiersByApplicationId: {},
    };

    const record = makeNavigationRecord();

    const result = enrichCommandMenuItemEventWithResolvedNavigation({
      record,
      flatObjectMetadataMaps: emptyMaps,
      locale: SOURCE_LOCALE,
      i18nInstance: mockI18nInstance,
    });

    expect(result).toBe(record);
  });

  it('should apply standard overrides when resolving templates', () => {
    const flatObjectMetadata = makeFlatObjectMetadata({
      labelPlural: 'People',
      icon: 'IconUser',
      standardOverrides: {
        labelPlural: 'Contacts',
        icon: 'IconContacts',
      } as unknown as FlatObjectMetadata['standardOverrides'],
    });
    const flatObjectMetadataMaps =
      makeFlatObjectMetadataMaps(flatObjectMetadata);

    const record = makeNavigationRecord();

    const result = enrichCommandMenuItemEventWithResolvedNavigation({
      record,
      flatObjectMetadataMaps,
      locale: SOURCE_LOCALE,
      i18nInstance: mockI18nInstance,
    });

    expect(result.label).toBe('Go to Contacts');
    expect(result.shortLabel).toBe('Contacts');
    expect(result.icon).toBe('IconContacts');
  });

  it('should use base values when standard overrides are null', () => {
    const flatObjectMetadata = makeFlatObjectMetadata({
      labelPlural: 'Companies',
      icon: 'IconBuilding',
      standardOverrides: null,
    });
    const flatObjectMetadataMaps =
      makeFlatObjectMetadataMaps(flatObjectMetadata);

    const record = makeNavigationRecord();

    const result = enrichCommandMenuItemEventWithResolvedNavigation({
      record,
      flatObjectMetadataMaps,
      locale: SOURCE_LOCALE,
      i18nInstance: mockI18nInstance,
    });

    expect(result.label).toBe('Go to Companies');
    expect(result.shortLabel).toBe('Companies');
    expect(result.icon).toBe('IconBuilding');
  });

  it('should return record unchanged when payload is null', () => {
    const flatObjectMetadata = makeFlatObjectMetadata();
    const flatObjectMetadataMaps =
      makeFlatObjectMetadataMaps(flatObjectMetadata);

    const record = makeNavigationRecord({ payload: null });

    const result = enrichCommandMenuItemEventWithResolvedNavigation({
      record,
      flatObjectMetadataMaps,
      locale: SOURCE_LOCALE,
      i18nInstance: mockI18nInstance,
    });

    expect(result).toBe(record);
  });

  it('should pass through already-resolved literal labels', () => {
    const flatObjectMetadata = makeFlatObjectMetadata();
    const flatObjectMetadataMaps =
      makeFlatObjectMetadataMaps(flatObjectMetadata);

    const record = makeNavigationRecord({
      label: 'Go to People',
      shortLabel: 'People',
      icon: 'IconUser',
    });

    const result = enrichCommandMenuItemEventWithResolvedNavigation({
      record,
      flatObjectMetadataMaps,
      locale: SOURCE_LOCALE,
      i18nInstance: mockI18nInstance,
    });

    expect(result.label).toBe('Go to People');
    expect(result.shortLabel).toBe('People');
    expect(result.icon).toBe('IconUser');
  });
});
