import { type FrontComponentSettingsTabManifest } from '@/application/frontComponentSettingsTabType';
import { isDefined } from '@/utils/validation/isDefined';

export const takesDefaultFrontComponentSettingsTab = (
  settingsTab: FrontComponentSettingsTabManifest | null | undefined,
): boolean => isDefined(settingsTab) && Object.keys(settingsTab).length === 0;
