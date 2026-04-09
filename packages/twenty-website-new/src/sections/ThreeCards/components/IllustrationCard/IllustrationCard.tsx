'use client';

import { Body, Heading, IconButton } from '@/design-system/components';
import { ArrowRightIcon } from '@/icons';
import { THREE_CARDS_ILLUSTRATIONS } from '@/illustrations';
import type { ThreeCardsIllustrationCardType } from '@/sections/ThreeCards/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { ThreeCardsCardShape } from './CardShape';

const IllustrationCardContainer = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto auto 1fr auto;
  gap: ${theme.spacing(4)};
  padding: ${theme.spacing(4)};
  background-color: ${theme.colors.primary.background[100]};
  border-radius: ${theme.radius(2)};
  isolation: isolate;
  min-width: 0;
  min-height: 0;
  height: 100%;
`;

const CardRule = styled.div`
  height: 0;
  border-top: 1px dotted ${theme.colors.primary.border[20]};
  width: 100%;
`;

const CardEmbed = styled.div`
  width: 100%;
  height: 240px;
  border: none;
  display: block;
  overflow: hidden;
  background-color: ${theme.colors.primary.background[100]};
  border-radius: ${theme.radius(2)};
`;

const CardFooter = styled.footer`
  display: grid;
  grid-template-columns: auto auto auto 1fr;
  align-items: start;
  column-gap: ${theme.spacing(2)};
`;

const AttributionPipe = styled.span`
  display: block;
  width: 0;
  height: 21px;
  border-left: 1px solid ${theme.colors.primary.border[20]};
`;

const FooterTrailingAction = styled.div`
  justify-self: end;
`;

const CardBodyCell = styled.div`
  align-self: start;
  min-height: 0;
  min-width: 0;
`;

type IllustrationCardProps = {
  illustrationCard: ThreeCardsIllustrationCardType;
  variant?: 'shaped' | 'simple';
};

export function IllustrationCard({
  illustrationCard,
  variant = 'shaped',
}: IllustrationCardProps) {
  const ThreeCardsIllustration =
    THREE_CARDS_ILLUSTRATIONS[illustrationCard.illustration];

  return (
    <IllustrationCardContainer>
      {variant === 'shaped' && (
        <ThreeCardsCardShape
          fillColor={theme.colors.primary.background[100]}
          strokeColor={theme.colors.primary.border[40]}
        />
      )}
      <Heading
        as="h3"
        segments={illustrationCard.heading}
        size="xs"
        weight="medium"
      />
      <CardRule />
      <CardEmbed>
        <ThreeCardsIllustration />
      </CardEmbed>
      <CardRule />
      <CardBodyCell>
        <Body body={illustrationCard.body} size="sm" weight="regular" />
      </CardBodyCell>

      {illustrationCard.attribution && (
        <CardFooter>
          <Body
            body={illustrationCard.attribution.role}
            size="xs"
            weight="medium"
          />
          <AttributionPipe aria-hidden />
          <Body
            body={illustrationCard.attribution.company}
            size="xs"
            weight="regular"
          />
          <FooterTrailingAction>
            <IconButton
              icon={ArrowRightIcon}
              ariaLabel="Learn more"
              borderColor={theme.colors.primary.border[20]}
              iconFillColor="transparent"
              iconSize={24}
              iconStrokeColor={theme.colors.primary.text[80]}
              size={48}
            />
          </FooterTrailingAction>
        </CardFooter>
      )}
    </IllustrationCardContainer>
  );
}
