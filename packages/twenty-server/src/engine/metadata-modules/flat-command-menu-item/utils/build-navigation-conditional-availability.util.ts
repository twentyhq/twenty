import { NEVER_AVAILABLE_CONDITIONAL_DISPLAY } from 'twenty-shared/constants';
import {
  type ConditionalDisplay,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { buildConditionalDisplayFromConditionNode } from 'twenty-shared/utils';

import { HIDDEN_NAVIGATION_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/metadata-modules/flat-command-menu-item/constants/hidden-navigation-object-universal-identifiers.constant';
export const buildNavigationConditionalAvailability = ({
  universalIdentifier,
  nameSingular,
}: {
  universalIdentifier: string;
  nameSingular: string;
}): ConditionalDisplay => {
  if (HIDDEN_NAVIGATION_OBJECT_UNIVERSAL_IDENTIFIERS.has(universalIdentifier)) {
    return NEVER_AVAILABLE_CONDITIONAL_DISPLAY;
  }

  return buildConditionalDisplayFromConditionNode({
    conditionNode: {
      kind: 'recordFilter',
      recordFilter: {
        contextKey: 'targetObjectReadPermissions',
        operand: ViewFilterOperand.IS,
        subFieldName: nameSingular,
        value: 'true',
      },
    },
    source: universalIdentifier,
  });
};
