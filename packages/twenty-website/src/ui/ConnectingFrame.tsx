import { styled } from '@linaria/react';

import { PlusMark } from '@/icons';
import {
  color,
  GUTTER,
  MAX_CONTENT_WIDTH_PX,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';

// The bracket that joins a section to the bordered band directly above it: two
// side rails + a base line + the bottom two plus-markers, open at the top so the
// band's own bottom markers complete the frame. Use it in a SectionShell
// `background` on a section that `connectsUp` and shares the band's scheme — the
// band yields its bottom rhythm and the rails ride the shared gutter, so the two
// read as one continuous frame. Desktop only; mobile drops the frame.
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
  left: ${spacing(GUTTER.md)};
  position: absolute;
  right: ${spacing(GUTTER.md)};
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

// The rails are 1px child lines on the frame's content edge (centre 0.5 inside
// it), so the marker is nudged half a pixel less than a bordered host's to land
// its cross on the rails' centreline crossing.
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

export function ConnectingFrame() {
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
