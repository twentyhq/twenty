import { buildNavigationConditionalAvailabilityExpression } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-object-navigation-universal-flat-command-menu-item.util';

describe('buildNavigationConditionalAvailabilityExpression', () => {
  it('gates navigation behind read permission on the target object', () => {
    expect(
      buildNavigationConditionalAvailabilityExpression({
        nameSingular: 'messageCampaign',
      }),
    ).toBe('targetObjectReadPermissions.messageCampaign');
  });
});
