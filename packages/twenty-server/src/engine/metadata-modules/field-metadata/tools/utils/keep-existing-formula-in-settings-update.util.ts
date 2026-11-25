import { isDefined, isPlainObject } from 'twenty-shared/utils';

type FieldMetadataSettingsUpdate = Record<string, unknown> | null | undefined;

// Settings are replaced whole, so an update that only changes, say, decimals would turn a formula field back into a plain one
export const keepExistingFormulaInSettingsUpdate = ({
  settings,
  existingSettings,
}: {
  settings: FieldMetadataSettingsUpdate;
  existingSettings: unknown;
}): FieldMetadataSettingsUpdate => {
  if (
    !isDefined(settings) ||
    'formula' in settings ||
    !isPlainObject(existingSettings) ||
    !isDefined(existingSettings.formula)
  ) {
    return settings;
  }

  return { ...settings, formula: existingSettings.formula };
};
