import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { v5 } from 'uuid';

import { CommandMenuItemAvailabilityType } from 'src/engine/metadata-modules/command-menu-item/enums/command-menu-item-availability-type.enum';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import {
  buildNavigationConditionalAvailabilityExpression,
  buildNavigationFlatCommandMenuItem,
  NAVIGATION_INTERPOLATED_ICON,
  NAVIGATION_INTERPOLATED_LABEL,
  NAVIGATION_INTERPOLATED_SHORT_LABEL,
} from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-flat-command-menu-item.util';

const NAVIGATION_COMMAND_UUID_NAMESPACE =
  'b31830da-2ae0-48eb-a915-12fa4ab96dd3';

const baseObjectMetadata = {
  id: 'obj-id-1',
  universalIdentifier: 'obj-universal-1',
  nameSingular: 'person',
  shortcut: 'P',
};

const baseArgs = {
  objectMetadata: baseObjectMetadata,
  commandMenuItemId: 'cmd-id-1',
  applicationId: 'app-id-1',
  applicationUniversalIdentifier: 'app-universal-1',
  workspaceId: 'ws-id-1',
  position: 5,
  now: '2026-01-01T00:00:00.000Z',
};

describe('buildNavigationFlatCommandMenuItem', () => {
  it('should produce a deterministic universalIdentifier via UUID v5', () => {
    const result = buildNavigationFlatCommandMenuItem(baseArgs);

    const expectedUniversalIdentifier = v5(
      baseObjectMetadata.universalIdentifier,
      NAVIGATION_COMMAND_UUID_NAMESPACE,
    );

    expect(result.universalIdentifier).toBe(expectedUniversalIdentifier);
  });

  it('should set label and shortLabel as interpolation templates', () => {
    const result = buildNavigationFlatCommandMenuItem(baseArgs);

    expect(result.label).toBe(NAVIGATION_INTERPOLATED_LABEL);
    expect(result.shortLabel).toBe(NAVIGATION_INTERPOLATED_SHORT_LABEL);
  });

  it('should set icon as interpolation template', () => {
    const result = buildNavigationFlatCommandMenuItem(baseArgs);

    expect(result.icon).toBe(NAVIGATION_INTERPOLATED_ICON);
  });

  it('should set payload with objectMetadataItemId', () => {
    const result = buildNavigationFlatCommandMenuItem(baseArgs);

    expect(result.payload).toEqual({ objectMetadataItemId: 'obj-id-1' });
  });

  it('should include shortcut in hotKeys when shortcut is defined', () => {
    const result = buildNavigationFlatCommandMenuItem(baseArgs);

    expect(result.hotKeys).toEqual(['G', 'P']);
  });

  it('should set hotKeys to null when shortcut is null', () => {
    const result = buildNavigationFlatCommandMenuItem({
      ...baseArgs,
      objectMetadata: { ...baseObjectMetadata, shortcut: null },
    });

    expect(result.hotKeys).toBeNull();
  });

  it('should use the provided id, applicationId, workspaceId, and position', () => {
    const result = buildNavigationFlatCommandMenuItem(baseArgs);

    expect(result.id).toBe('cmd-id-1');
    expect(result.applicationId).toBe('app-id-1');
    expect(result.workspaceId).toBe('ws-id-1');
    expect(result.position).toBe(5);
  });

  it('should set applicationUniversalIdentifier from the provided argument', () => {
    const result = buildNavigationFlatCommandMenuItem(baseArgs);

    expect(result.applicationUniversalIdentifier).toBe('app-universal-1');
  });

  it('should set engineComponentKey to NAVIGATION', () => {
    const result = buildNavigationFlatCommandMenuItem(baseArgs);

    expect(result.engineComponentKey).toBe(EngineComponentKey.NAVIGATION);
  });

  it('should set availabilityType to GLOBAL', () => {
    const result = buildNavigationFlatCommandMenuItem(baseArgs);

    expect(result.availabilityType).toBe(
      CommandMenuItemAvailabilityType.GLOBAL,
    );
  });

  it('should set conditionalAvailabilityExpression based on nameSingular', () => {
    const result = buildNavigationFlatCommandMenuItem(baseArgs);

    expect(result.conditionalAvailabilityExpression).toBe(
      'targetObjectReadPermissions.person',
    );
  });

  it('should additionally gate conditionalAvailabilityExpression behind the feature flag for feature-flagged objects', () => {
    const result = buildNavigationFlatCommandMenuItem({
      ...baseArgs,
      objectMetadata: {
        ...baseObjectMetadata,
        universalIdentifier: STANDARD_OBJECTS.callRecording.universalIdentifier,
        nameSingular: 'callRecording',
      },
    });

    expect(result.conditionalAvailabilityExpression).toBe(
      'featureFlags.IS_CALL_RECORDING_ENABLED and targetObjectReadPermissions.callRecording',
    );
  });

  it('should set isPinned to false', () => {
    const result = buildNavigationFlatCommandMenuItem(baseArgs);

    expect(result.isPinned).toBe(false);
  });

  it('should set null fields correctly', () => {
    const result = buildNavigationFlatCommandMenuItem(baseArgs);

    expect(result.frontComponentId).toBeNull();
    expect(result.frontComponentUniversalIdentifier).toBeNull();
    expect(result.workflowVersionId).toBeNull();
    expect(result.availabilityObjectMetadataId).toBeNull();
    expect(result.availabilityObjectMetadataUniversalIdentifier).toBeNull();
  });

  it('should set createdAt and updatedAt from the now parameter', () => {
    const result = buildNavigationFlatCommandMenuItem(baseArgs);

    expect(result.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(result.updatedAt).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('buildNavigationConditionalAvailabilityExpression', () => {
  it('gates the standard call recording object behind both the flag and read permission', () => {
    expect(
      buildNavigationConditionalAvailabilityExpression({
        universalIdentifier: STANDARD_OBJECTS.callRecording.universalIdentifier,
        nameSingular: 'callRecording',
      }),
    ).toBe(
      'featureFlags.IS_CALL_RECORDING_ENABLED and targetObjectReadPermissions.callRecording',
    );
  });

  it('returns only the read-permission expression for non-gated objects', () => {
    expect(
      buildNavigationConditionalAvailabilityExpression({
        universalIdentifier: 'obj-universal-1',
        nameSingular: 'person',
      }),
    ).toBe('targetObjectReadPermissions.person');
  });

  it('does not gate a custom object that reuses the callRecording name', () => {
    expect(
      buildNavigationConditionalAvailabilityExpression({
        universalIdentifier: 'custom-object-universal-id',
        nameSingular: 'callRecording',
      }),
    ).toBe('targetObjectReadPermissions.callRecording');
  });
});
