import { styled } from '@linaria/react';

import {
  color,
  FONT_WEIGHT,
  semanticColor,
  fontFamily,
  spacing,
  typeRampDeclarations,
} from '@/tokens';

const EyebrowRow = styled.p`
  align-items: center;
  color: ${semanticColor.inkMuted};
  display: flex;
  font-family: ${fontFamily('sans')};
  ${typeRampDeclarations('headingXs')}
  font-weight: ${FONT_WEIGHT.medium};
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
