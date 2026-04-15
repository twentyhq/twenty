'use client';

import { Body, Heading } from '@/design-system/components';
import { FastPathIcon, LiveDataIcon } from '@/icons';
import type { ThreeCardsFeatureCardType } from '@/sections/ThreeCards/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { IconUsersGroup } from '@tabler/icons-react';
import Image from 'next/image';
import { type ReactNode, useState } from 'react';
import { FastPathVisual } from './FastPathVisual';
import { FamiliarInterfaceVisual } from './FamiliarInterfaceVisual';
import { LiveDataVisual } from './LiveDataVisual';

const FeatureCardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto;
  background-color: ${theme.colors.primary.background[100]};
  border: 1px solid ${theme.colors.primary.border[20]};
  border-radius: ${theme.radius(2)};
  overflow: hidden;
  min-width: 0;
  height: 100%;
`;

const CardImage = styled.div`
  width: 100%;
  height: 508px;
  background-color: ${theme.colors.primary.border[10]};
  position: relative;
  overflow: hidden;
`;

const CardContent = styled.div`
  background-color: ${theme.colors.secondary.background[5]};
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(3)};
  padding: ${theme.spacing(3.5)} ${theme.spacing(4)} ${theme.spacing(4)};
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
  const [isHovered, setIsHovered] = useState(false);
  let visual: ReactNode;

  if ('illustration' in featureCard) {
    switch (featureCard.illustration) {
      case 'familiar-interface':
        visual = <FamiliarInterfaceVisual active={isHovered} />;
        break;
      case 'fast-path':
        visual = <FastPathVisual />;
        break;
      case 'live-data':
        visual = <LiveDataVisual active={isHovered} />;
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
      <CardImage>{visual}</CardImage>
      <CardContent>
        <CardTitleRow>
          <CardIcon>{renderFeatureCardIcon(featureCard.icon)}</CardIcon>
          <CardTitleWrap>
            <Heading
              as="h3"
              segments={featureCard.heading}
              size="xs"
              weight="medium"
            />
          </CardTitleWrap>
        </CardTitleRow>
        <Body body={featureCard.body} size="sm" weight="regular" />
      </CardContent>
    </FeatureCardContainer>
  );
}
