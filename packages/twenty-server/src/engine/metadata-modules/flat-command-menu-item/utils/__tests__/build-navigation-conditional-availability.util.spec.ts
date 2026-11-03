import { NEVER_AVAILABLE_CONDITIONAL_DISPLAY } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { ViewFilterOperand } from 'twenty-shared/types';

import { buildNavigationConditionalAvailability } from 'src/engine/metadata-modules/flat-command-menu-item/utils/build-navigation-conditional-availability.util';

describe('buildNavigationConditionalAvailability', () => {
  it('gates navigation behind read permission on the target object', () => {
    expect(
      buildNavigationConditionalAvailability({
        universalIdentifier: 'custom-object-universal-id',
        nameSingular: 'rocketLaunch',
      }),
    ).toEqual({
      recordFilters: [
        {
          id: expect.any(String),
          contextKey: 'targetObjectReadPermissions',
          subFieldName: 'rocketLaunch',
          operand: ViewFilterOperand.IS,
          value: 'true',
        },
      ],
    });
  });

  it('keeps the condition id when the object is renamed', () => {
    const [conditionBeforeRename] =
      buildNavigationConditionalAvailability({
        universalIdentifier: 'custom-object-universal-id',
        nameSingular: 'rocketLaunch',
      }).recordFilters ?? [];
    const [conditionAfterRename] =
      buildNavigationConditionalAvailability({
        universalIdentifier: 'custom-object-universal-id',
        nameSingular: 'spaceLaunch',
      }).recordFilters ?? [];

    expect(conditionAfterRename?.id).toBe(conditionBeforeRename?.id);
  });

  it('hides the workflow versions navigation', () => {
    expect(
      buildNavigationConditionalAvailability({
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
        nameSingular: 'workflowVersion',
      }),
    ).toEqual(NEVER_AVAILABLE_CONDITIONAL_DISPLAY);
  });

  it('does not hide a custom object that reuses a hidden object name', () => {
    expect(
      buildNavigationConditionalAvailability({
        universalIdentifier: 'custom-object-universal-id',
        nameSingular: 'workflowVersion',
      }),
    ).not.toEqual(NEVER_AVAILABLE_CONDITIONAL_DISPLAY);
  });
});
