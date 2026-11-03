import { type ConditionalDisplayVirtualField } from '@/types/conditional-display/ConditionalDisplayVirtualField';
import { type ConditionalAvailabilityCompiledItem } from '@/types/conditional-display/internal/ConditionalAvailabilityCompiledItem';
import { type ConditionalAvailabilitySubject } from '@/types/conditional-display/internal/ConditionalAvailabilitySubject';
import { getConditionalDisplayContextVirtualField } from '@/utils/conditional-display/getConditionalDisplayContextVirtualField';
import { isConditionalDisplayContextKey } from '@/utils/conditional-display/isConditionalDisplayContextKey';
import { isDefined } from '@/utils/validation/isDefined';

export const resolveConditionalAvailabilitySubject = (
  compiledItem: ConditionalAvailabilityCompiledItem | undefined,
):
  | (ConditionalAvailabilitySubject & {
      virtualField: ConditionalDisplayVirtualField;
    })
  | undefined => {
  if (
    compiledItem?.kind !== 'reference' ||
    !isConditionalDisplayContextKey(compiledItem.name)
  ) {
    return undefined;
  }

  const { name: contextKey, subFieldName } = compiledItem;
  const virtualField = getConditionalDisplayContextVirtualField({
    contextKey,
    subFieldName,
  });

  return isDefined(virtualField)
    ? { contextKey, subFieldName, virtualField }
    : undefined;
};
