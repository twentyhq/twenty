'use client';

import { Body, Heading } from '@/design-system/components';
import { FastPathIcon, LiveDataIcon } from '@/icons';
import { useRenderMessage } from '@/lib/i18n/use-render-message';
import type { ThreeCardsFeatureCardType } from '@/sections/ThreeCards/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { IconUsersGroup } from '@tabler/icons-react';
import Image from 'next/image';
import { type ReactNode, useRef, useState } from 'react';
import { FamiliarInterfaceVisual } from './FamiliarInterfaceVisual';
import { FastPathVisual } from './FastPathVisual';
import { LiveDataVisual } from './LiveDataVisual';

const FeatureCardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto;
  background-color: ${theme.colors.secondary.background[5]};
  border: 1px solid ${theme.colors.primary.border[20]};
  border-radius: ${theme.radius(2)};
  overflow: hidden;
  min-width: 0;
  height: 100%;
`;

const CardImage = styled.div`
  box-sizing: border-box;
  padding: 8px 8px 0;
  width: 100%;
`;

const CardImageFrame = styled.div`
  /*
   * Lock the frame to the scene design aspect (411 × 508). Every illustrated
   * visual mounted inside renders into a fixed 411 × 508 design box that gets
   * scaled by cardImageFrame.width / 411, so the frame, the scaled scene, and
   * any inner content all shrink together — no dead dark strip below the
   * scene, and identical visual proportions across the three cards at every
   * breakpoint.
   *
   * max-width (not max-height) caps the frame at the design width. With
   * aspect-ratio + max-height the browser clamps height but leaves width at
   * 100%, breaking the aspect contract and leaving a dark scene gutter on the
   * right. Clamping width preserves the ratio and derives the height from it.
   */
  aspect-ratio: 411 / 508;
  background-color: ${theme.colors.primary.border[10]};
  border-radius: 2px;
  isolation: isolate;
  margin: 0 auto;
  max-width: 411px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const CardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 8px;
  padding: ${theme.spacing(3)} ${theme.spacing(4)} ${theme.spacing(4)};
`;

const CardTitleRow = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  column-gap: ${theme.spacing(2)};
`;

const CardIcon = styled.div`
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
`;

const CardTitleWrap = styled.div`
  color: ${theme.colors.primary.text[100]};
  min-width: 0;
`;

const UsersGroupMarker = styled.div`
  align-items: center;
  background: ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(1)};
  color: ${theme.colors.primary.background[100]};
  display: flex;
  height: 22px;
  justify-content: center;
  width: 22px;
`;

const CardIconMarker = styled.div`
  align-items: center;
  background: ${theme.colors.highlight[100]};
  border-radius: ${theme.radius(1)};
  display: flex;
  height: 22px;
  justify-content: center;
  width: 22px;
`;

type FeatureCardProps = { featureCard: ThreeCardsFeatureCardType };

function renderFeatureCardIcon(icon: ThreeCardsFeatureCardType['icon']) {
  const strokeColor = theme.colors.primary.background[100];

  switch (icon) {
    case 'users-group':
      return (
        <UsersGroupMarker>
          <IconUsersGroup aria-hidden size={14} stroke={2} />
        </UsersGroupMarker>
      );
    case 'fast-path':
      return (
        <CardIconMarker>
          <FastPathIcon size={14.667} strokeColor={strokeColor} />
        </CardIconMarker>
      );
    case 'live-data':
      return (
        <CardIconMarker>
          <LiveDataIcon size={14.667} strokeColor={strokeColor} />
        </CardIconMarker>
      );
  }

  return null;
}

export function FeatureCard({ featureCard }: FeatureCardProps) {
  const renderText = useRenderMessage();
  const [isHovered, setIsHovered] = useState(false);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  let visual: ReactNode;

  if ('illustration' in featureCard) {
    switch (featureCard.illustration) {
      case 'familiar-interface':
        visual = (
          <FamiliarInterfaceVisual
            active={isHovered}
            backgroundImageRotationDeg={featureCard.backgroundImageRotationDeg}
            backgroundImageSrc={featureCard.backgroundImageSrc}
            pointerTargetRef={imageFrameRef}
          />
        );
        break;
      case 'fast-path':
        visual = (
          <FastPathVisual
            active={isHovered}
            backgroundImageRotationDeg={featureCard.backgroundImageRotationDeg}
            backgroundImageSrc={featureCard.backgroundImageSrc}
            pointerTargetRef={imageFrameRef}
          />
        );
        break;
      case 'live-data':
        visual = (
          <LiveDataVisual
            active={isHovered}
            backgroundImageRotationDeg={featureCard.backgroundImageRotationDeg}
            backgroundImageSrc={featureCard.backgroundImageSrc}
            pointerTargetRef={imageFrameRef}
          />
        );
        break;
    }
  } else {
    visual = (
      <Image
        src={featureCard.image.src}
        alt={featureCard.image.alt}
        fill
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <FeatureCardContainer
      onPointerEnter={() => {
        setIsHovered(true);
      }}
      onPointerLeave={() => {
        setIsHovered(false);
      }}
    >
      <CardImage>
        <CardImageFrame ref={imageFrameRef}>{visual}</CardImageFrame>
      </CardImage>
      <CardContent>
        <CardTitleRow>
          <CardIcon>{renderFeatureCardIcon(featureCard.icon)}</CardIcon>
          <CardTitleWrap>
            <Heading
              as="h3"
              renderText={renderText}
              segments={featureCard.heading}
              size="xs"
              weight="medium"
            />
          </CardTitleWrap>
        </CardTitleRow>
        <Body
          body={featureCard.body}
          renderText={renderText}
          size="sm"
          weight="regular"
        />
      </CardContent>
    </FeatureCardContainer>
  );
}
