import { isNonEmptyString } from '@sniptt/guards';
import { type ConditionalAvailabilityParseResult } from 'twenty-shared/types';
import {
  checkConditionalAvailabilityNode,
  isDefined,
  parseConditionalAvailabilityExpression,
} from 'twenty-shared/utils';

import { fromPageLayoutWidgetJsonLogicToConditionalAvailability } from 'src/engine/metadata-modules/page-layout-widget/utils/from-page-layout-widget-json-logic-to-conditional-availability.util';

export const fromLegacyPageLayoutWidgetRuleToConditionalAvailability = ({
  conditionalAvailabilityExpression,
  conditionalDisplay,
}: {
  conditionalAvailabilityExpression: string | null | undefined;
  conditionalDisplay: unknown;
}):
  | ConditionalAvailabilityParseResult
  | {
      isValid: false;
      errorCode: 'UNSUPPORTED_CONDITIONAL_DISPLAY';
      errorMessage: string;
    } => {
  if (isNonEmptyString(conditionalAvailabilityExpression)) {
    return parseConditionalAvailabilityExpression({
      expression: conditionalAvailabilityExpression,
      metadataName: 'pageLayoutWidget',
    });
  }

  if (!isDefined(conditionalDisplay)) {
    return { isValid: true, node: null };
  }

  const node =
    fromPageLayoutWidgetJsonLogicToConditionalAvailability(conditionalDisplay);

  if (!isDefined(node)) {
    return {
      isValid: false,
      errorCode: 'UNSUPPORTED_CONDITIONAL_DISPLAY',
      errorMessage: 'The json-logic rule has a shape that cannot be converted',
    };
  }

  return checkConditionalAvailabilityNode({
    node,
    metadataName: 'pageLayoutWidget',
  });
};
