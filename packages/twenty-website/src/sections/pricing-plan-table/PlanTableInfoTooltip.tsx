'use client';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useId } from 'react';

import { INFORMATIVE_MARKS } from '@/icons';
import {
  color,
  EASING,
  fontFamily,
  fontSize,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';

const InfoMark = INFORMATIVE_MARKS.info;

const TooltipAnchor = styled.span`
  display: inline-flex;
  margin-left: ${spacing(2)};
  vertical-align: middle;
`;

const InfoButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: 50%;
  color: ${semanticColor.inkSubtle};
  display: inline-flex;
  padding: 0;
  transition: color 0.2s ${EASING.standard};

  &:hover,
  &:focus-visible {
    color: ${semanticColor.ink};
  }

  &:focus-visible {
    outline: 1px solid ${color('blue')};
    outline-offset: 2px;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const TooltipBubble = styled.span`
  background-color: ${color('white')};
  border-radius: ${radius(2)};
  color: ${color('black')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  left: ${spacing(4)};
  line-height: 1.45;
  max-width: min(280px, calc(100vw - ${spacing(8)}));
  opacity: 0;
  padding: ${spacing(3)} ${spacing(4)};
  pointer-events: none;
  position: absolute;
  top: calc(100% - ${spacing(3)});
  transform: translateY(-${spacing(1)});
  transition:
    opacity 0.2s ${EASING.standard},
    transform 0.2s ${EASING.standard},
    visibility 0.2s;
  visibility: hidden;
  width: max-content;
  z-index: 10;

  ${TooltipAnchor}:hover &,
  ${TooltipAnchor}:focus-within & {
    opacity: 1;
    transform: translateY(0);
    visibility: visible;
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

// The bubble positions against the nearest positioned ancestor (the feature
// label cell), so it opens from the cell's left edge instead of the icon.
export function PlanTableInfoTooltip({ text }: { text: MessageDescriptor }) {
  const { i18n } = useLingui();
  const tooltipId = useId();

  return (
    <TooltipAnchor>
      <InfoButton
        aria-describedby={tooltipId}
        aria-label={i18n._(msg`More information`)}
        type="button"
      >
        <InfoMark color="currentColor" sizePx={16} strokeWidth={1.5} />
      </InfoButton>
      <TooltipBubble id={tooltipId} role="tooltip">
        {i18n._(text)}
      </TooltipBubble>
    </TooltipAnchor>
  );
}
