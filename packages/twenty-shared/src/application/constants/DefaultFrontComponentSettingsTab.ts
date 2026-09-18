import { type FrontComponentSettingsTabManifest } from '@/application/frontComponentSettingsTabType';

export const DEFAULT_FRONT_COMPONENT_SETTINGS_TAB = {
  label: 'Variables',
  icon: 'IconVariable',
  position: 0,
} as const satisfies Required<FrontComponentSettingsTabManifest>;
