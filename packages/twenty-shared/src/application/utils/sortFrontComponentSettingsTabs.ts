import { type FrontComponentSettingsTabManifest } from '@/application/frontComponentSettingsTabType';

export const DEFAULT_FRONT_COMPONENT_SETTINGS_TAB_POSITION = 0;

type SortableFrontComponentSettingsTab = {
  universalIdentifier: string;
  settingsTab?: FrontComponentSettingsTabManifest | null;
};

export const sortFrontComponentSettingsTabs = <
  TFrontComponent extends SortableFrontComponentSettingsTab,
>(
  frontComponents: TFrontComponent[],
): TFrontComponent[] =>
  [...frontComponents].sort((a, b) => {
    const positionDifference =
      (a.settingsTab?.position ??
        DEFAULT_FRONT_COMPONENT_SETTINGS_TAB_POSITION) -
      (b.settingsTab?.position ??
        DEFAULT_FRONT_COMPONENT_SETTINGS_TAB_POSITION);

    if (positionDifference !== 0) {
      return positionDifference;
    }

    return a.universalIdentifier.localeCompare(b.universalIdentifier);
  });
