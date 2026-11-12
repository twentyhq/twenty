import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { isDefined } from '@/utils/validation/isDefined';

export const renameValidationRulePath = ({
  path,
  bindings,
  fieldNameByUniversalIdentifier,
}: {
  path: string;
  bindings: ValidationRuleBindings;
  fieldNameByUniversalIdentifier: Map<string, string>;
}): string => {
  const segments = path.split('.');

  return segments
    .map((segment, index) => {
      const boundUniversalIdentifier =
        bindings[segments.slice(0, index + 1).join('.')];

      // A deleted field keeps its old name, so the next compile reports it as unknown
      return (
        (isDefined(boundUniversalIdentifier)
          ? fieldNameByUniversalIdentifier.get(boundUniversalIdentifier)
          : undefined) ?? segment
      );
    })
    .join('.');
};
