import { isNonEmptyString } from '@sniptt/guards';
import {
  isDefined,
  type TemplateVariableWithFallback,
} from 'twenty-shared/utils';

export const resolveCampaignVariableValue = ({
  campaignVariable: { name, fallback },
  variables,
}: {
  campaignVariable: TemplateVariableWithFallback;
  variables: Record<string, string>;
}): string => {
  const value = Object.prototype.hasOwnProperty.call(variables, name)
    ? (variables[name] ?? '')
    : '';

  return isDefined(fallback) && !isNonEmptyString(value.trim())
    ? fallback
    : value;
};
