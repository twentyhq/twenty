export const RESERVED_FRONT_COMPONENT_SETTINGS_TAB_LABELS = [
  'General',
] as const;

export const isReservedFrontComponentSettingsTabLabel = (
  label: string,
): boolean =>
  RESERVED_FRONT_COMPONENT_SETTINGS_TAB_LABELS.some(
    (reservedLabel) =>
      reservedLabel.toLowerCase() === label.trim().toLowerCase(),
  );
