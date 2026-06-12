'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { IconUsersGroup } from '@tabler/icons-react';
import NextImage from 'next/image';
import { useRef, useState, type ReactNode } from 'react';

import { FastPathIcon, LiveDataIcon } from '@/icons';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  radius,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Body } from '@/ui';

import { FamiliarInterfaceVisual } from './familiar-interface/familiar-interface-visual';
import { type FeatureCardRecord } from './feature-cards.data';

const CardContainer = styled.div`
  background-color: ${color('black-5')};
  border: 1px solid ${color('black-20')};
  border-radius: ${radius(2)};
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto;
  height: 100%;
  min-width: 0;
  overflow: hidden;
`;

const CardImage = styled.div`
  box-sizing: border-box;
  padding: ${spacing(2)} ${spacing(2)} 0;
  width: 100%;
`;

// The scene design box every feature-card visual is authored in.
const SCENE_DESIGN_WIDTH_PX = 411;
const SCENE_DESIGN_HEIGHT_PX = 508;

// Locked to the scene design box: every scene renders a fixed 411x508
// design box scaled by frame-width / 411, so the frame, the scaled scene,
// and any inner content shrink together at every breakpoint.
const CardImageFrame = styled.div`
  aspect-ratio: ${SCENE_DESIGN_WIDTH_PX} / ${SCENE_DESIGN_HEIGHT_PX};
  background-color: ${color('black-10')};
  border-radius: 2px;
  isolation: isolate;
  margin: 0 auto;
  max-width: ${SCENE_DESIGN_WIDTH_PX}px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const CardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  padding: ${spacing(3)} ${spacing(4)} ${spacing(4)};
  row-gap: ${spacing(2)};
`;

const CardTitleRow = styled.div`
  align-items: center;
  column-gap: ${spacing(2)};
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
`;

const IconMarker = styled.div`
  align-items: center;
  background: ${color('blue')};
  border-radius: ${radius(1)};
  color: ${color('white')};
  display: flex;
  height: 22px;
  justify-content: center;
  width: 22px;
`;

const CardHeading = styled.h3`
  ${typeRampDeclarations('headingXs')}
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.medium};
  margin: 0;
  min-width: 0;
`;

function FeatureIcon({ icon }: { icon: FeatureCardRecord['icon'] }) {
  if (icon === 'users-group') {
    return <IconUsersGroup aria-hidden size={14} stroke={2} />;
  }
  if (icon === 'fast-path') return <FastPathIcon sizePx={14.667} />;
  return <LiveDataIcon sizePx={14.667} />;
}

export function FeatureCard({ card }: { card: FeatureCardRecord }) {
  const { i18n } = useLingui();
  const [isHovered, setIsHovered] = useState(false);
  const imageFrameRef = useRef<HTMLDivElement>(null);

  const backgroundImage = (
    <NextImage
      alt=""
      fill
      sizes={`(max-width: 768px) 100vw, ${SCENE_DESIGN_WIDTH_PX}px`}
      src={card.backgroundImageSrc}
      style={{ objectFit: 'cover' }}
    />
  );

  // The live-data and fast-path scenes land with their own commits; their
  // frames keep the gradient bottom layer until then.
  let visual: ReactNode = backgroundImage;
  if (card.illustration === 'familiar-interface') {
    visual = (
      <FamiliarInterfaceVisual
        active={isHovered}
        backgroundImageSrc={card.backgroundImageSrc}
        pointerTargetRef={imageFrameRef}
      />
    );
  }

  return (
    <CardContainer
      onPointerEnter={() => {
        setIsHovered(true);
      }}
      onPointerLeave={() => {
        setIsHovered(false);
      }}
    >
      <CardImage>
        <CardImageFrame
          data-illustration={card.illustration}
          ref={imageFrameRef}
        >
          {visual}
        </CardImageFrame>
      </CardImage>
      <CardContent>
        <CardTitleRow>
          <IconMarker aria-hidden>
            <FeatureIcon icon={card.icon} />
          </IconMarker>
          <CardHeading>{i18n._(card.heading)}</CardHeading>
        </CardTitleRow>
        <Body size="sm">{i18n._(card.body)}</Body>
      </CardContent>
    </CardContainer>
  );
}
