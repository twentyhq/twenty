import { DEFAULT_FRONT_COMPONENT_SETTINGS_TAB } from '@/application/constants/DefaultFrontComponentSettingsTab';
import { type FrontComponentSettingsTabManifest } from '@/application/frontComponentSettingsTabType';

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
        DEFAULT_FRONT_COMPONENT_SETTINGS_TAB.position) -
      (b.settingsTab?.position ??
        DEFAULT_FRONT_COMPONENT_SETTINGS_TAB.position);

    if (positionDifference !== 0) {
      return positionDifference;
    }

    return a.universalIdentifier.localeCompare(b.universalIdentifier);
  });
