import { isDefined, isPlainObject } from 'twenty-shared/utils';

// A settings update replaces the other settings, but leaves the formula as it is unless it sends one: null removes it
export const keepExistingFormulaWhenLeftOut = <TSettings>({
  settings,
  existingSettings,
}: {
  settings: TSettings;
  existingSettings: unknown;
}): TSettings => {
  if (
    !isPlainObject(settings) ||
    'formula' in settings ||
    !isPlainObject(existingSettings) ||
    !isDefined(existingSettings.formula)
  ) {
    return settings;
  }

  return { ...settings, formula: existingSettings.formula };
};
