export type ValidationRuleFieldChange = {
  fieldUniversalIdentifier: string;
  newFieldName: string | null;
  shouldDisableRulesReadingField: boolean;
  shouldDetachErrorField: boolean;
};
