import type { HeadingType } from '@/design-system/components/Heading';

/**
 * Slot marker for the marquee heading.
 *
 * Renders nothing on its own — `<Marquee.Root>` discovers it by
 * `displayName` match (see `Root.tsx`) and pulls `segments` out to
 * feed the two animated `<Track>` rows. The slot exists so the public
 * shape mirrors every other section (children-driven compound) instead
 * of taking a prop.
 */
type HeadingProps = {
  segments: HeadingType[];
};

export function Heading(_props: HeadingProps) {
  return null;
}

Heading.displayName = 'Marquee.Heading';
