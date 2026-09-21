import isEqual from 'lodash.isequal';
import {
  type FieldMetadataType,
  USER_OVERRIDABLE_PRESENTATION_FIELD_SETTINGS_BY_TYPE,
} from 'twenty-shared/types';

// Returns the settings keys that changed and are NOT user-overridable
// presentation settings for the field type. An empty array means the update
// only touches presentation settings a workspace is allowed to override even on
// a system-managed field.
export const getNonUserOverridableSettingsChanges = ({
  fieldType,
  incomingSettings,
  existingSettings,
}: {
  fieldType: FieldMetadataType;
  incomingSettings: Record<string, unknown> | null | undefined;
  existingSettings: Record<string, unknown> | null | undefined;
}): string[] => {
  const overridableKeys: readonly string[] =
    USER_OVERRIDABLE_PRESENTATION_FIELD_SETTINGS_BY_TYPE[
      fieldType as keyof typeof USER_OVERRIDABLE_PRESENTATION_FIELD_SETTINGS_BY_TYPE
    ] ?? [];

  const settingsKeys = new Set([
    ...Object.keys(incomingSettings ?? {}),
    ...Object.keys(existingSettings ?? {}),
  ]);

  return [...settingsKeys].filter(
    (key) =>
      !overridableKeys.includes(key) &&
      !isEqual(incomingSettings?.[key], existingSettings?.[key]),
  );
};
