import { styled } from '@linaria/react';

import { ArrowUpRight } from '@/icons';
import { color } from '@/tokens';

const ArrowSlot = styled.span`
  color: ${color('blue')};
  display: inline-flex;
`;

// The blue outbound arrow that marks external destinations.
export function ExternalArrow() {
  return (
    <ArrowSlot aria-hidden>
      <ArrowUpRight sizePx={8} />
    </ArrowSlot>
  );
}
