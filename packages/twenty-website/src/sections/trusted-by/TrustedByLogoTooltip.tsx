'use client';

import { Tooltip } from '@base-ui/react/tooltip';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import {
  color,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
  Z_INDEX,
} from '@/tokens';

const Trigger = styled(Tooltip.Trigger)`
  border-radius: ${radius(1)};
  display: flex;
  flex-shrink: 0;

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: ${spacing(1)};
  }
`;

const Positioner = styled(Tooltip.Positioner)`
  z-index: ${Z_INDEX.portal};
`;

const Popup = styled(Tooltip.Popup)`
  background: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  box-shadow: ${SHADOW.popup};
  display: flex;
  flex-direction: column;
  font-family: ${fontFamily('sans')};
  max-width: 240px;
  padding: ${spacing(2)} ${spacing(3)};
  transition:
    opacity 0.15s ${EASING.standard},
    transform 0.15s ${EASING.standard};

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: translateY(${spacing(1)});
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const BrandName = styled.span`
  color: ${semanticColor.ink};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 1.4;
`;

const BrandDescription = styled.span`
  color: ${semanticColor.inkMuted};
  font-size: ${fontSize(3)};
  line-height: 1.4;
`;

export type TrustedByLogoTooltipProps = {
  children: ReactNode;
  description: string;
  name: string;
};

export function TrustedByLogoTooltip({
  children,
  description,
  name,
}: TrustedByLogoTooltipProps) {
  return (
    <Tooltip.Root>
      <Trigger delay={150} render={<span tabIndex={0} />}>
        {children}
      </Trigger>
      <Tooltip.Portal>
        <Positioner side="top" sideOffset={10}>
          <Popup>
            <BrandName>{name}</BrandName>
            <BrandDescription>{description}</BrandDescription>
          </Popup>
        </Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
