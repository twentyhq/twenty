import { type FrontComponentSettingsTabManifest } from '@/application/frontComponentSettingsTabType';
import { isDefined } from '@/utils/validation/isDefined';

// A settings component declares itself by carrying a settingsTab at all, so an
// empty one is how "marked as a settings tab, presentation left to the default"
// is expressed — it is not the same as carrying no tab.
export const takesDefaultFrontComponentSettingsTab = (
  settingsTab: FrontComponentSettingsTabManifest | null | undefined,
): boolean => isDefined(settingsTab) && Object.keys(settingsTab).length === 0;
