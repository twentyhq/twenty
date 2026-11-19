import { isNonEmptyString } from '@sniptt/guards';
import { type ConditionalAvailabilityNode } from 'twenty-shared/types';
import {
  checkConditionalAvailabilityNode,
  isDefined,
  parseConditionalAvailabilityExpression,
} from 'twenty-shared/utils';

import { fromPageLayoutWidgetJsonLogicToConditionalAvailability } from 'src/engine/metadata-modules/page-layout-widget/utils/from-page-layout-widget-json-logic-to-conditional-availability.util';

type LegacyPageLayoutWidgetRuleConversion =
  | {
      isConvertible: true;
      conditionalAvailability: ConditionalAvailabilityNode | null;
    }
  | { isConvertible: false; reason: string; message: string };

export const fromLegacyPageLayoutWidgetRuleToConditionalAvailability = ({
  conditionalAvailabilityExpression,
  conditionalDisplay,
}: {
  conditionalAvailabilityExpression: string | null | undefined;
  conditionalDisplay: unknown;
}): LegacyPageLayoutWidgetRuleConversion => {
  if (isNonEmptyString(conditionalAvailabilityExpression)) {
    const parseResult = parseConditionalAvailabilityExpression({
      expression: conditionalAvailabilityExpression,
      metadataName: 'pageLayoutWidget',
    });

    return parseResult.isValid
      ? { isConvertible: true, conditionalAvailability: parseResult.node }
      : {
          isConvertible: false,
          reason: parseResult.errorCode,
          message: parseResult.errorMessage,
        };
  }

  if (!isDefined(conditionalDisplay)) {
    return { isConvertible: true, conditionalAvailability: null };
  }

  const node =
    fromPageLayoutWidgetJsonLogicToConditionalAvailability(conditionalDisplay);

  if (!isDefined(node)) {
    return {
      isConvertible: false,
      reason: 'UNSUPPORTED_CONDITIONAL_DISPLAY',
      message: 'The json-logic rule has a shape that cannot be converted',
    };
  }

  const checkResult = checkConditionalAvailabilityNode({
    node,
    metadataName: 'pageLayoutWidget',
  });

  return checkResult.isValid
    ? { isConvertible: true, conditionalAvailability: checkResult.node }
    : {
        isConvertible: false,
        reason: checkResult.errorCode,
        message: checkResult.errorMessage,
      };
};
