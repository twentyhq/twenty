import { styled } from '@linaria/react';

import {
  color,
  fluidFontSize,
  FONT_WEIGHT,
  fontFamily,
  spacing,
} from '@/tokens';

const EyebrowRow = styled.p`
  align-items: center;
  color: ${color('black-60')};
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fluidFontSize(4.5, 5.5)};
  font-weight: ${FONT_WEIGHT.medium};
  gap: ${spacing(2)};
  line-height: 1.33;
  margin: 0;
`;

// The marker is a plain rounded rectangle — CSS, not an SVG asset.
const Marker = styled.span`
  background-color: ${color('blue')};
  border-radius: 1px;
  flex-shrink: 0;
  height: 7px;
  width: 14px;
`;

export type EyebrowProps = {
  children: string;
};

export function Eyebrow({ children }: EyebrowProps) {
  return (
    <EyebrowRow>
      <Marker aria-hidden />
      {children}
    </EyebrowRow>
  );
}
