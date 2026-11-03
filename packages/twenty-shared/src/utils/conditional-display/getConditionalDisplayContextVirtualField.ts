import { isNonEmptyString } from '@sniptt/guards';

import { CONDITIONAL_DISPLAY_CONTEXT_KEYS } from '@/constants/ConditionalDisplayContextKeys';
import { type ConditionalDisplayContextKey } from '@/types/conditional-display/ConditionalDisplayContextKey';
import { type ConditionalDisplayVirtualField } from '@/types/conditional-display/ConditionalDisplayVirtualField';

export const getConditionalDisplayContextVirtualField = ({
  contextKey,
  subFieldName,
}: {
  contextKey: ConditionalDisplayContextKey;
  subFieldName?: string | null;
}): ConditionalDisplayVirtualField | undefined => {
  const { subject } = CONDITIONAL_DISPLAY_CONTEXT_KEYS[contextKey];

  switch (subject.kind) {
    case 'value':
      return isNonEmptyString(subFieldName) ? undefined : subject.field;
    case 'mapEntry':
      return isNonEmptyString(subFieldName) ? subject.entryField : undefined;
    case 'property':
      return isNonEmptyString(subFieldName) &&
        Object.prototype.hasOwnProperty.call(
          subject.propertyFields,
          subFieldName,
        )
        ? subject.propertyFields[subFieldName]
        : undefined;
    case 'selectedRecordPath':
      return undefined;
  }
};
