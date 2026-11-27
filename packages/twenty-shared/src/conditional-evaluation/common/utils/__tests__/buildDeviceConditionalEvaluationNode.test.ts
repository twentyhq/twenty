import { buildDeviceConditionalEvaluationNode } from '@/conditional-evaluation/common/utils/buildDeviceConditionalEvaluationNode';
import { evaluateConditionalEvaluationNode } from '@/conditional-evaluation/evaluate/utils/evaluateConditionalEvaluationNode';
import { validateConditionalEvaluationNode } from '@/conditional-evaluation/validate/utils/validateConditionalEvaluationNode';

describe('buildDeviceConditionalEvaluationNode', () => {
  it.each(['MOBILE', 'DESKTOP'] as const)(
    'should build a rule a page layout widget accepts for %s',
    (device) => {
      expect(
        validateConditionalEvaluationNode({
          node: buildDeviceConditionalEvaluationNode(device),
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
        evaluateConditionalEvaluationNode({
          node: buildDeviceConditionalEvaluationNode(ruleDevice),
          context: { device: currentDevice },
        }),
      ).toBe(isVisible);
    },
  );
});
