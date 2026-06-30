import { styled } from '@linaria/react';

import { LIVE_DATA_SCENE } from '@/tokens/feature-scenes/live-data-scene';

const TomCursorGlyph = styled.svg`
  display: block;
  filter: ${LIVE_DATA_SCENE.colors.cursorShadow};
  height: 38px;
  transform: rotate(-90deg) scaleY(-1);
  transform-origin: center;
  width: 41px;
`;

// Tom's wider cursor arrow (authored glyph, verbatim).
export function TomCursor() {
  return (
    <TomCursorGlyph
      fill="none"
      viewBox="0 0 40.7459 37.7835"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M39.2312 0.0359766C40.2403 -0.208095 41.0759 0.836037 40.6166 1.76715L23.188 37.1009C22.7265 38.0363 21.3815 38.003 20.967 37.0458L14.3553 21.777C14.2684 21.5764 14.1294 21.4027 13.9528 21.274L0.503957 11.477C-0.339096 10.8629 -0.0768831 9.54315 0.936912 9.29795L39.2312 0.0359766Z"
        fill={LIVE_DATA_SCENE.colors.orange}
      />
    </TomCursorGlyph>
  );
}
