import { styled } from '@linaria/react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  semanticColor,
  spacing,
} from '@/tokens';

const EyebrowRow = styled.p`
  align-items: center;
  color: ${semanticColor.inkMuted};
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.04em;
  line-height: ${fontSize(6)};
  gap: ${spacing(2)};
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
