import { buildDeviceConditionalAvailability } from '@/conditional-availability/utils/buildDeviceConditionalAvailability';
import { evaluateConditionalAvailabilityNode } from '@/conditional-availability/utils/evaluateConditionalAvailabilityNode';
import { validateConditionalAvailabilityNode } from '@/conditional-availability/utils/validateConditionalAvailabilityNode';

describe('buildDeviceConditionalAvailability', () => {
  it.each(['MOBILE', 'DESKTOP'] as const)(
    'should build a rule a page layout widget accepts for %s',
    (device) => {
      expect(
        validateConditionalAvailabilityNode({
          node: buildDeviceConditionalAvailability(device),
          metadataName: 'pageLayoutWidget',
        }),
      ).toMatchObject({ isValid: true });
    },
  );

  it.each([
    ['MOBILE', 'MOBILE', true],
    ['MOBILE', 'DESKTOP', false],
    ['DESKTOP', 'DESKTOP', true],
    ['DESKTOP', 'MOBILE', false],
  ] as const)(
    'should build a %s rule that gives %s on %s',
    (ruleDevice, currentDevice, isVisible) => {
      expect(
        evaluateConditionalAvailabilityNode({
          node: buildDeviceConditionalAvailability(ruleDevice),
          context: { device: currentDevice },
        }),
      ).toBe(isVisible);
    },
  );
});
