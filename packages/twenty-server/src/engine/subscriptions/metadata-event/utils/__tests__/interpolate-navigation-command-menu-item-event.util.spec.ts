import { type EffectiveEntityI18nContext } from 'src/engine/metadata-modules/utils/effective-entity-i18n-context.type';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import {
  NAVIGATION_INTERPOLATED_ICON,
  NAVIGATION_INTERPOLATED_LABEL,
  NAVIGATION_INTERPOLATED_SHORT_LABEL,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { interpolateNavigationCommandMenuItemEvent } from 'src/engine/subscriptions/metadata-event/utils/interpolate-navigation-command-menu-item-event.util';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const mockI18nInstance = {
  _: (messageId: string) => messageId,
};

const OBJECT_METADATA_ID = 'obj-id-1';

const makeFlatObjectMetadata = (
  overrides?: Partial<FlatObjectMetadata>,
): FlatObjectMetadata =>
  ({
    id: OBJECT_METADATA_ID,
    universalIdentifier: 'obj-uid-1',
    workspaceId: 'ws-1',
    applicationId: 'app-1',
    applicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION.universalIdentifier,
    labelPlural: 'People',
    labelSingular: 'Person',
    icon: 'IconUser',
    overrides: null,
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
  overrides?: Record<string, unknown>,
): Record<string, unknown> => ({
  id: 'cmd-id-1',
  engineComponentKey: EngineComponentKey.NAVIGATION,
  label: NAVIGATION_INTERPOLATED_LABEL,
  shortLabel: NAVIGATION_INTERPOLATED_SHORT_LABEL,
  icon: NAVIGATION_INTERPOLATED_ICON,
  payload: { objectMetadataItemId: OBJECT_METADATA_ID },
  position: 1,
  isPinned: false,
  ...overrides,
});

const buildStandardI18nContext = (): EffectiveEntityI18nContext => ({
  locale: SOURCE_LOCALE,
  i18nInstance: mockI18nInstance,
  isStandardApp: true,
  applicationCatalog: undefined,
});

describe('interpolateNavigationCommandMenuItemEvent', () => {
  it('should resolve label, shortLabel, and icon templates for NAVIGATION items', () => {
    const flatObjectMetadata = makeFlatObjectMetadata();
    const flatObjectMetadataMaps =
      makeFlatObjectMetadataMaps(flatObjectMetadata);

    const record = makeNavigationRecord();

    const result = interpolateNavigationCommandMenuItemEvent({
      record,
      flatObjectMetadataMaps,
      buildI18nContext: buildStandardI18nContext,
    });

    expect(result.label).toBe('Go to People');
    expect(result.shortLabel).toBe('People');
    expect(result.icon).toBe('IconUser');
  });

  it('should not interpolate a non-NAVIGATION item', () => {
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

    const result = interpolateNavigationCommandMenuItemEvent({
      record,
      flatObjectMetadataMaps,
      buildI18nContext: buildStandardI18nContext,
    });

    expect(result).toEqual(record);
  });

  it('should not interpolate when payload has no objectMetadataItemId', () => {
    const flatObjectMetadata = makeFlatObjectMetadata();
    const flatObjectMetadataMaps =
      makeFlatObjectMetadataMaps(flatObjectMetadata);

    const record = makeNavigationRecord({
      payload: { path: '/settings' },
    });

    const result = interpolateNavigationCommandMenuItemEvent({
      record,
      flatObjectMetadataMaps,
      buildI18nContext: buildStandardI18nContext,
    });

    expect(result).toEqual(record);
  });

  it('should not interpolate when object metadata is not found in maps', () => {
    const emptyMaps: FlatEntityMaps<FlatObjectMetadata> = {
      byUniversalIdentifier: {},
      universalIdentifierById: {},
      universalIdentifiersByApplicationId: {},
    };

    const record = makeNavigationRecord();

    const result = interpolateNavigationCommandMenuItemEvent({
      record,
      flatObjectMetadataMaps: emptyMaps,
      buildI18nContext: buildStandardI18nContext,
    });

    expect(result).toEqual(record);
  });

  it('should apply standard overrides when resolving templates', () => {
    const flatObjectMetadata = makeFlatObjectMetadata({
      labelPlural: 'People',
      icon: 'IconUser',
      overrides: {
        labelPlural: 'Contacts',
        icon: 'IconContacts',
      } as unknown as FlatObjectMetadata['overrides'],
    });
    const flatObjectMetadataMaps =
      makeFlatObjectMetadataMaps(flatObjectMetadata);

    const record = makeNavigationRecord();

    const result = interpolateNavigationCommandMenuItemEvent({
      record,
      flatObjectMetadataMaps,
      buildI18nContext: buildStandardI18nContext,
    });

    expect(result.label).toBe('Go to Contacts');
    expect(result.shortLabel).toBe('Contacts');
    expect(result.icon).toBe('IconContacts');
  });

  it('should use base values when standard overrides are null', () => {
    const flatObjectMetadata = makeFlatObjectMetadata({
      labelPlural: 'Companies',
      icon: 'IconBuilding',
      overrides: null,
    });
    const flatObjectMetadataMaps =
      makeFlatObjectMetadataMaps(flatObjectMetadata);

    const record = makeNavigationRecord();

    const result = interpolateNavigationCommandMenuItemEvent({
      record,
      flatObjectMetadataMaps,
      buildI18nContext: buildStandardI18nContext,
    });

    expect(result.label).toBe('Go to Companies');
    expect(result.shortLabel).toBe('Companies');
    expect(result.icon).toBe('IconBuilding');
  });

  it('should not interpolate when payload is null', () => {
    const flatObjectMetadata = makeFlatObjectMetadata();
    const flatObjectMetadataMaps =
      makeFlatObjectMetadataMaps(flatObjectMetadata);

    const record = makeNavigationRecord({ payload: null });

    const result = interpolateNavigationCommandMenuItemEvent({
      record,
      flatObjectMetadataMaps,
      buildI18nContext: buildStandardI18nContext,
    });

    expect(result).toEqual(record);
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

    const result = interpolateNavigationCommandMenuItemEvent({
      record,
      flatObjectMetadataMaps,
      buildI18nContext: buildStandardI18nContext,
    });

    expect(result.label).toBe('Go to People');
    expect(result.shortLabel).toBe('People');
    expect(result.icon).toBe('IconUser');
  });
  it('should return a non-NAVIGATION item untouched', () => {
    const flatObjectMetadata = makeFlatObjectMetadata();
    const flatObjectMetadataMaps =
      makeFlatObjectMetadataMaps(flatObjectMetadata);

    const record = makeNavigationRecord({
      engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
      label: 'Export View',
      shortLabel: undefined,
      icon: 'IconPlus',
      payload: undefined,
    });

    const result = interpolateNavigationCommandMenuItemEvent({
      record,
      flatObjectMetadataMaps,
      buildI18nContext: buildStandardI18nContext,
    });

    expect(result).toEqual(record);
  });
});
