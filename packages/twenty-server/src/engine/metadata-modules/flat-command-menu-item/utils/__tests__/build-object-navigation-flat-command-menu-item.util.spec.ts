import { getSystemNavigationCommandMenuItemUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { CommandMenuItemAvailabilityType } from 'twenty-shared/types';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import {
  NAVIGATION_INTERPOLATED_ICON,
  NAVIGATION_INTERPOLATED_LABEL,
  NAVIGATION_INTERPOLATED_SHORT_LABEL,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-universal-flat-command-menu-item.util';
import { buildObjectNavigationFlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-flat-command-menu-item.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const OTHER_APPLICATION_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000002';

const baseObjectMetadata = {
  id: 'obj-id-1',
  universalIdentifier: 'obj-universal-1',
  nameSingular: 'person',
  shortcut: 'P',
  isActive: true,
};

const baseArgs = {
  objectMetadata: baseObjectMetadata,
  commandMenuItemId: 'cmd-id-1',
  applicationId: 'app-id-1',
  applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  workspaceId: 'ws-id-1',
  position: 5,
  now: '2026-01-01T00:00:00.000Z',
};

describe('buildObjectNavigationFlatCommandMenuItem', () => {
  it('should derive the universalIdentifier from the application and the object', () => {
    const result = buildObjectNavigationFlatCommandMenuItem(baseArgs);

    const expectedUniversalIdentifier =
      getSystemNavigationCommandMenuItemUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          baseArgs.applicationUniversalIdentifier,
        objectUniversalIdentifier: baseObjectMetadata.universalIdentifier,
      });

    expect(result.universalIdentifier).toBe(expectedUniversalIdentifier);
  });

  it('should derive different universalIdentifiers for different applications', () => {
    const result = buildObjectNavigationFlatCommandMenuItem(baseArgs);
    const otherApplicationResult = buildObjectNavigationFlatCommandMenuItem({
      ...baseArgs,
      applicationUniversalIdentifier: OTHER_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(result.universalIdentifier).not.toBe(
      otherApplicationResult.universalIdentifier,
    );
  });

  it('should set label and shortLabel as interpolation templates', () => {
    const result = buildObjectNavigationFlatCommandMenuItem(baseArgs);

    expect(result.label).toBe(NAVIGATION_INTERPOLATED_LABEL);
    expect(result.shortLabel).toBe(NAVIGATION_INTERPOLATED_SHORT_LABEL);
  });

  it('should set icon as interpolation template', () => {
    const result = buildObjectNavigationFlatCommandMenuItem(baseArgs);

    expect(result.icon).toBe(NAVIGATION_INTERPOLATED_ICON);
  });

  it('should set a null payload', () => {
    const result = buildObjectNavigationFlatCommandMenuItem(baseArgs);

    expect(result.payload).toBeNull();
  });

  it('should set the target object metadata foreign key', () => {
    const result = buildObjectNavigationFlatCommandMenuItem(baseArgs);

    expect(result.navigationTargetObjectMetadataId).toBe('obj-id-1');
    expect(result.navigationTargetObjectMetadataUniversalIdentifier).toBe(
      'obj-universal-1',
    );
  });

  it('should include shortcut in hotKeys when shortcut is defined', () => {
    const result = buildObjectNavigationFlatCommandMenuItem(baseArgs);

    expect(result.hotKeys).toEqual(['G', 'P']);
  });

  it('should set hotKeys to null when shortcut is null', () => {
    const result = buildObjectNavigationFlatCommandMenuItem({
      ...baseArgs,
      objectMetadata: { ...baseObjectMetadata, shortcut: null },
    });

    expect(result.hotKeys).toBeNull();
  });

  it('should use the provided id, applicationId, workspaceId, and position', () => {
    const result = buildObjectNavigationFlatCommandMenuItem(baseArgs);

    expect(result.id).toBe('cmd-id-1');
    expect(result.applicationId).toBe('app-id-1');
    expect(result.workspaceId).toBe('ws-id-1');
    expect(result.position).toBe(5);
  });

  it('should set applicationUniversalIdentifier from the provided argument', () => {
    const result = buildObjectNavigationFlatCommandMenuItem(baseArgs);

    expect(result.applicationUniversalIdentifier).toBe(
      APPLICATION_UNIVERSAL_IDENTIFIER,
    );
  });

  it('should set engineComponentKey to NAVIGATION', () => {
    const result = buildObjectNavigationFlatCommandMenuItem(baseArgs);

    expect(result.engineComponentKey).toBe(EngineComponentKey.NAVIGATION);
  });

  it('should set availabilityType to GLOBAL', () => {
    const result = buildObjectNavigationFlatCommandMenuItem(baseArgs);

    expect(result.availabilityType).toBe(
      CommandMenuItemAvailabilityType.GLOBAL,
    );
  });

  it('should set conditionalAvailabilityExpression based on nameSingular', () => {
    const result = buildObjectNavigationFlatCommandMenuItem(baseArgs);

    expect(result.conditionalAvailabilityExpression).toBe(
      'targetObjectReadPermissions.person',
    );
  });

  it('should additionally gate conditionalAvailabilityExpression behind the feature flag for feature-flagged objects', () => {
    const result = buildObjectNavigationFlatCommandMenuItem({
      ...baseArgs,
      objectMetadata: {
        ...baseObjectMetadata,
        universalIdentifier:
          STANDARD_OBJECTS.messageCampaign.universalIdentifier,
        nameSingular: 'messageCampaign',
      },
    });

    expect(result.conditionalAvailabilityExpression).toBe(
      'featureFlags.IS_EMAIL_GROUP_ENABLED and targetObjectReadPermissions.messageCampaign',
    );
  });

  it('should set isPinned to false', () => {
    const result = buildObjectNavigationFlatCommandMenuItem(baseArgs);

    expect(result.isPinned).toBe(false);
  });

  it('should set null fields correctly', () => {
    const result = buildObjectNavigationFlatCommandMenuItem(baseArgs);

    expect(result.frontComponentId).toBeNull();
    expect(result.frontComponentUniversalIdentifier).toBeNull();
    expect(result.workflowVersionId).toBeNull();
    expect(result.availabilityObjectMetadataId).toBeNull();
    expect(result.availabilityObjectMetadataUniversalIdentifier).toBeNull();
  });

  it('should set createdAt and updatedAt from the now parameter', () => {
    const result = buildObjectNavigationFlatCommandMenuItem(baseArgs);

    expect(result.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(result.updatedAt).toBe('2026-01-01T00:00:00.000Z');
  });
});
