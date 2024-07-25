import {
  RULE_NAME as injectWorkspaceRepositoryName,
  rule as injectWorkspaceRepository,
} from './rules/inject-workspace-repository';
import {
  rule as componentPropsNaming,
  RULE_NAME as componentPropsNamingName,
} from './rules/component-props-naming';
import {
  rule as effectComponents,
  RULE_NAME as effectComponentsName,
} from './rules/effect-components';
import {
  rule as explicitBooleanPredicatesInIf,
  RULE_NAME as explicitBooleanPredicatesInIfName,
} from './rules/explicit-boolean-predicates-in-if';
import {
  rule as matchingStateVariable,
  RULE_NAME as matchingStateVariableName,
} from './rules/matching-state-variable';
import {
  rule as maxConstsPerFile,
  RULE_NAME as maxConstsPerFileName,
} from './rules/max-consts-per-file';
import {
  rule as noHardcodedColors,
  RULE_NAME as noHardcodedColorsName,
} from './rules/no-hardcoded-colors';
import {
  rule as noNavigatePreferLink,
  RULE_NAME as noNavigatePreferLinkName,
} from './rules/no-navigate-prefer-link';
import {
  rule as noStateUseref,
  RULE_NAME as noStateUserefName,
} from './rules/no-state-useref';
import {
  rule as sortCssPropertiesAlphabetically,
  RULE_NAME as sortCssPropertiesAlphabeticallyName,
} from './rules/sort-css-properties-alphabetically';
import {
  rule as styledComponentsPrefixedWithStyled,
  RULE_NAME as styledComponentsPrefixedWithStyledName,
} from './rules/styled-components-prefixed-with-styled';
import {
  rule as useGetLoadableAndGetValueToGetAtoms,
  RULE_NAME as useGetLoadableAndGetValueToGetAtomsName,
} from './rules/use-getLoadable-and-getValue-to-get-atoms';
import {
  rule as useRecoilCallbackHasDependencyArray,
  RULE_NAME as useRecoilCallbackHasDependencyArrayName,
} from './rules/useRecoilCallback-has-dependency-array';

/**
 * Import your custom workspace rules at the top of this file.
 *
 * For example:
 *
 * import { RULE_NAME as myCustomRuleName, rule as myCustomRule } from './rules/my-custom-rule';
 *
 * In order to quickly get started with writing rules you can use the
 * following generator command and provide your desired rule name:
 *
 * ```sh
 * npx nx g @nx/eslint:workspace-rule {{ NEW_RULE_NAME }}
 * ```
 */

module.exports = {
  /**
   * Apply the imported custom rules here.
   *
   * For example (using the example import above):
   *
   * rules: {
   *  [myCustomRuleName]: myCustomRule
   * }
   */
  rules: {
    [componentPropsNamingName]: componentPropsNaming,
    [effectComponentsName]: effectComponents,
    [matchingStateVariableName]: matchingStateVariable,
    [noHardcodedColorsName]: noHardcodedColors,
    [noStateUserefName]: noStateUseref,
    [sortCssPropertiesAlphabeticallyName]: sortCssPropertiesAlphabetically,
    [styledComponentsPrefixedWithStyledName]:
      styledComponentsPrefixedWithStyled,
    [explicitBooleanPredicatesInIfName]: explicitBooleanPredicatesInIf,
    [useGetLoadableAndGetValueToGetAtomsName]:
      useGetLoadableAndGetValueToGetAtoms,
    [maxConstsPerFileName]: maxConstsPerFile,
    [useRecoilCallbackHasDependencyArrayName]:
      useRecoilCallbackHasDependencyArray,
    [noNavigatePreferLinkName]: noNavigatePreferLink,
    [injectWorkspaceRepositoryName]: injectWorkspaceRepository,
  },
};
