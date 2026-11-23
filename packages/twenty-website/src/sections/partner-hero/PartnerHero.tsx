import { type MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  GRADIENT,
  HERO_COMPOSITION,
  mediaUp,
  radius,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Body, Heading, HeadingPair, SectionShell } from '@/ui';

import { type PartnerHeroStat } from './partner-hero-stat.type';
import { PartnerVisual } from './PartnerVisual';

const GradientBackdrop = styled.div`
  background: ${GRADIENT.heroGlow};
  inset: 0 -20%;
  position: absolute;
`;

// The hero reads as one composition on the shared hero rhythm (HomeHero /
// PricingHero): Heading->Body 12px (HeadingPair), Body->CTA 32px, CTA->visual
// 68px (HERO_COMPOSITION). The intro is centered; the halftone stage hangs
// below at that single CTA-to-visual step.
const IntroStack = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;

  & > * + * {
    margin-top: ${spacing(8)};
  }
`;

const TitleBlock = styled.div`
  & > * + * {
    margin-top: ${spacing(5)};
  }
`;

const Badge = styled.span`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: ${semanticColor.inkMuted};
  display: inline-block;
  font-family: ${fontFamily('mono')};
  font-size: 11px;
  letter-spacing: 0.06em;
  line-height: 16px;
  padding: 2px 7px;
  text-transform: uppercase;
`;

const HeadingMeasure = styled.div`
  max-width: 360px;
  width: 100%;

  ${mediaUp('md')} {
    max-width: 672px;
  }
`;

const BodyMeasure = styled.div`
  margin-inline: auto;
  max-width: 360px;

  ${mediaUp('md')} {
    max-width: 500px;
  }
`;

const CtaRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${spacing(3)};
  justify-content: center;

  ${mediaUp('sm')} {
    flex-direction: row;
  }
`;

const StatStage = styled.div`
  margin-top: ${spacing(12)};

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

// Hairlines between cells, no frame, on the hero's centered axis.
const StatList = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  list-style: none;
  padding: 0;

  ${mediaUp('md')} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;

const StatCell = styled.li`
  border-left: 1px solid ${semanticColor.line};
  padding: ${spacing(5)} ${spacing(4)};
  text-align: center;

  & > * + * {
    margin-top: ${spacing(1.5)};
  }

  &:nth-child(odd) {
    border-left: none;
  }

  &:nth-child(n + 3) {
    border-top: 1px solid ${semanticColor.line};
  }

  ${mediaUp('md')} {
    padding: ${spacing(6)} ${spacing(4)};

    &:nth-child(odd) {
      border-left: 1px solid ${semanticColor.line};
    }

    &:nth-child(n + 3) {
      border-top: none;
    }

    &:first-child {
      border-left: none;
    }
  }
`;

const StatValue = styled.p`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  ${typeRampDeclarations('headingSm')}
  font-weight: ${FONT_WEIGHT.light};
  letter-spacing: -0.04em;
`;

const StatLabel = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const StatNote = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 1.4;
  text-align: center;
`;

const VisualStage = styled.div`
  margin-top: ${HERO_COMPOSITION.ctaToVisualGapPx}px;

  &[data-follows-stats] {
    margin-top: ${spacing(6)};
  }
  width: 100%;
`;

type PartnerHeroProps = {
  heading: MessageDescriptor;
  body: MessageDescriptor;
  badge?: MessageDescriptor;
  actions: ReactNode;
  stats?: readonly PartnerHeroStat[];
  statsNote?: MessageDescriptor;
  visualImageUrl?: string;
};

export function PartnerHero({
  heading,
  body,
  badge,
  actions,
  stats,
  statsNote,
  visualImageUrl,
}: PartnerHeroProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell
      background={<GradientBackdrop />}
      rhythm="hero"
      scheme="light"
    >
      <IntroStack>
        <TitleBlock>
          {isDefined(badge) && (
            <div>
              <Badge>{i18n._(badge)}</Badge>
            </div>
          )}
          <HeadingPair>
            <HeadingMeasure>
              <Heading as="h1" size="lg" weight="light">
                {i18n._(heading)}
              </Heading>
            </HeadingMeasure>
            <BodyMeasure>
              <Body muted size="sm">
                {i18n._(body)}
              </Body>
            </BodyMeasure>
          </HeadingPair>
        </TitleBlock>
        <CtaRow>{actions}</CtaRow>
      </IntroStack>
      {isDefined(stats) && (
        <StatStage>
          <StatList>
            {stats.map((stat) => (
              <StatCell key={stat.label.id}>
                <StatValue>{i18n._(stat.value)}</StatValue>
                <StatLabel>{i18n._(stat.label)}</StatLabel>
              </StatCell>
            ))}
          </StatList>
          {isDefined(statsNote) && <StatNote>{i18n._(statsNote)}</StatNote>}
        </StatStage>
      )}
      <VisualStage data-follows-stats={isDefined(stats) ? '' : undefined}>
        <PartnerVisual imageUrl={visualImageUrl} />
      </VisualStage>
    </SectionShell>
  );
}
