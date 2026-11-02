import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { buildNavigationConditionalAvailabilityExpression } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-universal-flat-command-menu-item.util';

describe('buildNavigationConditionalAvailabilityExpression', () => {
  it('gates navigation behind read permission on the target object', () => {
    expect(
      buildNavigationConditionalAvailabilityExpression({
        universalIdentifier:
          STANDARD_OBJECTS.messageCampaign.universalIdentifier,
        nameSingular: 'messageCampaign',
      }),
    ).toBe('targetObjectReadPermissions.messageCampaign');
  });

  it('hides the workflow versions navigation', () => {
    expect(
      buildNavigationConditionalAvailabilityExpression({
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
        nameSingular: 'workflowVersion',
      }),
    ).toBe('false');
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
