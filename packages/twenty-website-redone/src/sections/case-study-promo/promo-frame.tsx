import { styled } from '@linaria/react';

import { PlusMark } from '@/icons';
import {
  color,
  MAX_CONTENT_WIDTH_PX,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';

const CORNER_SIZE_PX = 14;

// The promo's decorative bracket (desktop only): two vertical rails and a base
// line framing the content, with plus markers at the bottom corners. It is
// open at the top so it reads as continuing up into the TrustedBy band above
// — the old compactTop form, the only one the partners promo ever uses.
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

// Top at 0 so the rails meet the TrustedBy band's bottom corner markers right
// at the seam (the section connectsUp, so that band sits one step above).
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

const Corner = styled.span`
  align-items: center;
  color: ${color('blue')};
  display: flex;
  height: ${CORNER_SIZE_PX}px;
  justify-content: center;
  line-height: 0;
  position: absolute;
  width: ${CORNER_SIZE_PX}px;
`;

const CornerBottomLeft = styled(Corner)`
  bottom: -7px;
  left: -7px;
`;

const CornerBottomRight = styled(Corner)`
  bottom: -7px;
  right: -7px;
`;

export function PromoFrame() {
  return (
    <Board aria-hidden>
      <Frame>
        <BottomLine />
        <LeftLine />
        <RightLine />
        <CornerBottomLeft>
          <PlusMark sizePx={CORNER_SIZE_PX} />
        </CornerBottomLeft>
        <CornerBottomRight>
          <PlusMark sizePx={CORNER_SIZE_PX} />
        </CornerBottomRight>
      </Frame>
    </Board>
  );
}
