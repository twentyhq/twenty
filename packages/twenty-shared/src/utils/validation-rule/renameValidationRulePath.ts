import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { isDefined } from '@/utils/validation/isDefined';

// Each bound prefix (company, company.employees, previous.company.employees) names one field
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

      return (
        (isDefined(boundUniversalIdentifier)
          ? fieldNameByUniversalIdentifier.get(boundUniversalIdentifier)
          : undefined) ?? segment
      );
    })
    .join('.');
};
