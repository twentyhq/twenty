import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

const STEPS = Array.from({ length: 12 }, (_, index) => index + 1);

// Twelve cumulative months as halftone dash rows. The parent sizes it and
// sets --stairs-ink, --stairs-dash and --stairs-pitch.
const Stairs = styled.span`
  align-items: end;
  column-gap: var(--stairs-gap, 4px);
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));

  & > span {
    background: var(--stairs-ink, currentColor);
    height: calc(var(--step) * 100%);
    mask-image: repeating-linear-gradient(
      to top,
      black 0 var(--stairs-dash, 2px),
      transparent var(--stairs-dash, 2px) var(--stairs-pitch, 6px)
    );
  }
`;

type IntegratorStairsProps = {
  className?: string;
};

// PROTOTYPE: the hero object's motif, reused small and large.
export function IntegratorStairs({ className }: IntegratorStairsProps) {
  return (
    <Stairs aria-hidden className={className}>
      {STEPS.map((step) => (
        <span key={step} style={{ '--step': step / 12 } as CSSProperties} />
      ))}
    </Stairs>
  );
}
