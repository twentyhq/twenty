import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { buildNavigationConditionalAvailabilityExpression } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-universal-flat-command-menu-item.util';

describe('buildNavigationConditionalAvailabilityExpression', () => {
  it('gates a feature-flagged standard object behind both the flag and read permission', () => {
    expect(
      buildNavigationConditionalAvailabilityExpression({
        universalIdentifier:
          STANDARD_OBJECTS.messageCampaign.universalIdentifier,
        nameSingular: 'messageCampaign',
      }),
    ).toBe(
      'featureFlags.IS_EMAIL_GROUP_ENABLED and targetObjectReadPermissions.messageCampaign',
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

  it('does not gate a custom object that reuses a feature-flagged object name', () => {
    expect(
      buildNavigationConditionalAvailabilityExpression({
        universalIdentifier: 'custom-object-universal-id',
        nameSingular: 'messageCampaign',
      }),
    ).toBe('targetObjectReadPermissions.messageCampaign');
  });

  it('hides a standard object whose flag replaces its navigation', () => {
    expect(
      buildNavigationConditionalAvailabilityExpression({
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
        nameSingular: 'workflowVersion',
      }),
    ).toBe(
      'not featureFlags.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED and targetObjectReadPermissions.workflowVersion',
    );
  });

  it('does not hide a custom object that reuses a hidden object name', () => {
    expect(
      buildNavigationConditionalAvailabilityExpression({
        universalIdentifier: 'custom-object-universal-id',
        nameSingular: 'workflowVersion',
      }),
    ).toBe('targetObjectReadPermissions.workflowVersion');
  });
});
