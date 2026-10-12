import { type CollapsiblePanelProps } from '../src/primitives/layout/Collapsible/types/CollapsiblePanelProps';
import { type CollapsibleRootProps } from '../src/primitives/layout/Collapsible/types/CollapsibleRootProps';
import { type CollapsibleTriggerProps } from '../src/primitives/layout/Collapsible/types/CollapsibleTriggerProps';

export const COLLAPSIBLE_PART_PROP_DESCRIPTIONS = {
  Root: {
    open: 'Controlled expansion state. Use defaultOpen for uncontrolled state.',
    defaultOpen: 'Initial uncontrolled expansion state.',
    onOpenChange:
      'Called with the requested open state and cancelable Base UI event details.',
    disabled: 'Default disabled state inherited by the triggers in this root.',
    render: 'Replaces the root div. Forward the supplied props and ref.',
  } satisfies Partial<Record<keyof CollapsibleRootProps, string>>,
  Trigger: {
    disabled: 'Disables this trigger.',
    nativeButton:
      'Set to false when render replaces the native button with another element.',
    render:
      'Replaces the linked trigger button. Forward the supplied props and ref.',
  } satisfies Partial<Record<keyof CollapsibleTriggerProps, string>>,
  Panel: {
    dimension: 'Dimension animated when the panel opens and closes.',
    containAnimation:
      'Clips overflowing content during expansion and uses a column layout.',
    duration:
      'Theme timing preset for both size and opacity. Native style can customize transition timing.',
    keepMounted:
      'Keeps the closed panel mounted and hidden, preserving local content state.',
    hiddenUntilFound:
      'Uses hidden until-found so browser page search can reveal the contents. Overrides keepMounted.',
    render:
      'Replaces the animated panel div. Forward the supplied props and ref.',
  } satisfies Partial<Record<keyof CollapsiblePanelProps, string>>,
};
