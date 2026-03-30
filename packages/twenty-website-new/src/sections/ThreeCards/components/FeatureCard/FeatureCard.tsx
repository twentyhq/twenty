import { Body, Heading } from '@/design-system/components';
import { RectangleFillIcon } from '@/icons';
import { ThreeCardsFeatureCardType } from '@/sections/ThreeCards/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import Image from 'next/image';

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
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${theme.spacing(4)};
  padding: ${theme.spacing(4)};
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

const HeadingWrap = styled.div`
  min-width: 0;
`;

type FeatureCardProps = { featureCard: ThreeCardsFeatureCardType };

export function FeatureCard({ featureCard }: FeatureCardProps) {
  return (
    <FeatureCardContainer>
      <CardImage>
        <Image
          src={featureCard.image.src}
          alt={featureCard.image.alt}
          fill
          style={{ objectFit: 'cover' }}
        />
      </CardImage>
      <CardContent>
        <CardTitleRow>
          <CardIcon>
            <RectangleFillIcon
              size={14}
              fillColor={theme.colors.highlight[100]}
            />
          </CardIcon>
          <HeadingWrap>
            <Heading
              as="h3"
              segments={featureCard.heading}
              size="xs"
              weight="medium"
            />
          </HeadingWrap>
        </CardTitleRow>
        <Body body={featureCard.body} size="sm" weight="regular" />
      </CardContent>
    </FeatureCardContainer>
  );
}
