import { styled } from '@linaria/react';

import {
  color,
  FONT_WEIGHT,
  fontFamily,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';

const EyebrowRow = styled.p`
  align-items: center;
  color: ${semanticColor.inkMuted};
  /* Inline-level so the intro's alignment governs the row as one unit
     (the old site centers it in centered intros); the wrapped label
     itself stays flush against the marker via text-align. */
  display: inline-flex;
  text-align: start;
  font-family: ${fontFamily('sans')};
  ${typeRampDeclarations('eyebrow')}
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.04em;
  gap: ${spacing(2)};
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
