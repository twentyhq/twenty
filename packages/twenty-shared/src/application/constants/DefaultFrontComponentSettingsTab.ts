import { type FrontComponentSettingsTabManifest } from '@/application/frontComponentSettingsTabType';

// Before tabs existed, an application's single settings component replaced the
// generated Variables tab rather than sitting next to it, so a tab left
// undeclared keeps presenting itself as that same Variables tab.
export const DEFAULT_FRONT_COMPONENT_SETTINGS_TAB = {
  label: 'Variables',
  icon: 'IconVariable',
  position: 0,
} as const satisfies Required<FrontComponentSettingsTabManifest>;
