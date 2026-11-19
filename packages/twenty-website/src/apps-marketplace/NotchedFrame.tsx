import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { color, radius, spacing } from '@/tokens';

// PROTOTYPE: a width-stable take on sections/three-cards/CardShape (the
// folder-tab outline), which only holds its drawing near 443x494.
const NOTCH_HEIGHT_PX = 24;
const NOTCH_SLOPE_WIDTH_PX = 66.276;
const NOTCH_FILL_PATH =
  'M0 0c.932 0 1.856.163 2.731.48l60.814 22.09c.875.318 1.8.48 2.731.48V24H0Z';
const NOTCH_STROKE_PATH =
  'M0 .5c.874 0 1.74.152 2.561.45l60.813 22.09c.931.338 1.912.51 2.902.51';

const Frame = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Cap = styled.div`
  display: flex;
  height: ${NOTCH_HEIGHT_PX}px;

  svg {
    display: block;
    flex-shrink: 0;
  }
`;

const Tab = styled.div`
  background-color: ${color('white')};
  border-left: 1px solid ${color('black-20')};
  border-top: 1px solid ${color('black-20')};
  border-top-left-radius: ${radius(1)};
  flex: 0 1 62%;
  min-width: ${spacing(10)};
`;

const Gap = styled.div`
  border-bottom: 1px solid ${color('black-20')};
  flex: 1 0 ${spacing(6)};
  margin-right: ${radius(1)};
`;

const FrameBody = styled.div`
  background-color: ${color('white')};
  border: 1px solid ${color('black-20')};
  border-radius: 0 ${radius(1)} ${radius(1)} ${radius(1)};
  border-top: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
`;

export function NotchedFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Frame>
      <Cap aria-hidden>
        <Tab />
        <svg
          fill="none"
          height={NOTCH_HEIGHT_PX}
          viewBox={`0 0 ${NOTCH_SLOPE_WIDTH_PX} ${NOTCH_HEIGHT_PX}`}
          width={NOTCH_SLOPE_WIDTH_PX}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={NOTCH_FILL_PATH} fill={color('white')} />
          <path d={NOTCH_STROKE_PATH} stroke={color('black-20')} />
        </svg>
        <Gap />
      </Cap>
      <FrameBody className={className}>{children}</FrameBody>
    </Frame>
  );
}
