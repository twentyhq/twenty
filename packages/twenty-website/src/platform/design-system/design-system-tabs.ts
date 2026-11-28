// One tab per level group: tokens and src/ui, src/sections, the routes.
export const DESIGN_SYSTEM_TABS = [
  { id: 'components', label: 'Components', href: '/design-system' },
  { id: 'sections', label: 'Sections', href: '/design-system/sections' },
  { id: 'pages', label: 'Pages', href: '/design-system/pages' },
] as const;

export type DesignSystemTab = (typeof DESIGN_SYSTEM_TABS)[number]['id'];
