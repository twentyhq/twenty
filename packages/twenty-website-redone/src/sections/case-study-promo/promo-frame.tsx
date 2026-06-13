import { styled } from '@linaria/react';

import { PlusMark } from '@/icons';
import {
  color,
  MAX_CONTENT_WIDTH_PX,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';

// The promo's decorative bracket (desktop only): two vertical rails and a base
// line, inset from the corners so each rail stops short of its plus marker (the
// design's deliberate gap). Open at the top so it reads as continuing up into
// the TrustedBy band above (the section connectsUp) — those top corners are
// TrustedBy's own markers flowing in, so the promo only draws the bottom two.
const Board = styled.div`
  display: none;
  inset: 0;
  margin: 0 auto;
  max-width: ${MAX_CONTENT_WIDTH_PX}px;
  pointer-events: none;
  position: absolute;

  ${mediaUp('md')} {
    display: block;
  }
`;

const Frame = styled.div`
  bottom: ${spacing(12)};
  left: ${spacing(10)};
  position: absolute;
  right: ${spacing(10)};
  top: 0;
`;

const Line = styled.span`
  background-color: ${semanticColor.line};
  position: absolute;
`;

const BottomLine = styled(Line)`
  bottom: 0;
  height: 1px;
  left: ${spacing(5)};
  right: ${spacing(5)};
`;

const LeftLine = styled(Line)`
  bottom: ${spacing(5)};
  left: 0;
  top: 0;
  width: 1px;
`;

const RightLine = styled(Line)`
  bottom: ${spacing(5)};
  right: 0;
  top: 0;
  width: 1px;
`;

// The rails are 1px child lines sitting on the frame's content edge (centre 0.5
// inside it), not a border — so the marker is nudged half a pixel less than a
// bordered host's to land its cross on the rails' centreline crossing.
const Corner = styled.span`
  color: ${color('blue')};
  line-height: 0;
  position: absolute;
`;

const CornerBottomLeft = styled(Corner)`
  bottom: -6.5px;
  left: -6.5px;
`;

const CornerBottomRight = styled(Corner)`
  bottom: -6.5px;
  right: -6.5px;
`;

export function PromoFrame() {
  return (
    <Board aria-hidden>
      <Frame>
        <BottomLine />
        <LeftLine />
        <RightLine />
        <CornerBottomLeft>
          <PlusMark sizePx={14} />
        </CornerBottomLeft>
        <CornerBottomRight>
          <PlusMark sizePx={14} />
        </CornerBottomRight>
      </Frame>
    </Board>
  );
}
