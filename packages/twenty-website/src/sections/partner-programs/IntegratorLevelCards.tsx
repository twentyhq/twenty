import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import { isDefined } from 'twenty-shared/utils';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import { HalftoneModel } from '@/platform/visuals/rigs/HalftoneModel';
import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Heading, SectionShell } from '@/ui';

import { type IntegratorLevel } from './integrator-level.type';
import { INTEGRATOR_LEVEL_MODELS } from './integrator-level-models';
import { IntegratorLedger } from './IntegratorLedger';

const Stack = styled.div`
  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const Intro = styled.div`
  margin-inline: auto;
  max-width: 720px;
  padding-bottom: ${spacing(9)};
  text-align: center;
`;

const Grid = styled.ul`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: minmax(0, 1fr);
  list-style: none;
  padding: 0;

  ${mediaUp('md')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

// Narrower than the page column, like Biograph's pair of cards.
const Measure = styled.div`
  margin-inline: auto;
  max-width: 1040px;
`;

// After Biograph's memberships: name on top, a large visual in the middle,
// what the level includes below. The second level is the filled one.
const Card = styled.article`
  animation: integrator-level-card-in ${DURATION.xl} ${EASING.standard}
    backwards;
  animation-delay: calc(var(--card-index) * 80ms);
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  &[data-filled] {
    background-color: ${color('black')};
  }

  @keyframes integrator-level-card-in {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const CardHeader = styled.div`
  padding: ${spacing(8)} ${spacing(8)} 0;

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const Title = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(8)};
  font-weight: ${FONT_WEIGHT.regular};
  letter-spacing: -0.02em;
  line-height: 1.15;
`;

const Tagline = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: 1.5;
`;

// The 3D slot: Twenty dash rows behind the level's shape, fading at the edges.
const Visual = styled.div`
  align-items: center;
  display: flex;
  height: 240px;
  justify-content: center;
  margin-top: ${spacing(8)};
  position: relative;

  ${mediaUp('md')} {
    height: 280px;
  }

  &::before {
    background-image: repeating-linear-gradient(
      to bottom,
      ${semanticColor.line} 0 1px,
      transparent 1px 8px
    );
    content: '';
    inset: 0;
    mask-image: radial-gradient(ellipse 60% 70% at 50% 50%, black, transparent);
    position: absolute;
  }
`;

const ModelMount = styled.div`
  aspect-ratio: 1 / 1;
  height: 200px;
  position: relative;

  ${mediaUp('md')} {
    height: 240px;
  }
`;

const CardBody = styled.div`
  flex: 1 1 auto;
  padding: ${spacing(8)};

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const PerksIntro = styled.p`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.medium};
`;

const Perks = styled.ul`
  list-style: none;
  padding: 0;

  & > li {
    align-items: center;
    color: ${semanticColor.inkMuted};
    column-gap: ${spacing(3)};
    display: flex;
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(3.5)};
    line-height: 22px;
    padding-block: ${spacing(1.5)};
  }

  & > li > svg {
    color: ${semanticColor.ink};
    flex-shrink: 0;
  }
`;

const LedgerRow = styled.div`
  padding-top: ${spacing(3)};
`;

type CardStyle = CSSProperties & { '--card-index': number };

type IntegratorLevelCardsProps = {
  levels: readonly IntegratorLevel[];
  ledgerFootnote: MessageDescriptor;
};

// The levels as section 2 (Thomas, 2026-11-18), then
// the ledger that prices them.
export function IntegratorLevelCards({
  levels,
  ledgerFootnote,
}: IntegratorLevelCardsProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell keepsTopRhythm scheme="dark">
      <Stack>
        <Intro>
          <Heading as="h2" size="lg" weight="light">
            {i18n._(msg`Start as an integrator, *grow into a lead*`)}
          </Heading>
        </Intro>
        <Measure>
          <Grid>
            {levels.map((level, index) => {
              const style: CardStyle = { '--card-index': index };
              const levelModel = INTEGRATOR_LEVEL_MODELS[index];

              return (
                <li key={level.title.id}>
                  <Card data-filled={index > 0 ? '' : undefined} style={style}>
                    <CardHeader>
                      <Title>{i18n._(level.title)}</Title>
                      <Tagline>{i18n._(level.tagline)}</Tagline>
                    </CardHeader>
                    <Visual
                      aria-hidden
                      data-model-slot={`integrator-level-${index + 1}`}
                    >
                      {isDefined(levelModel) && (
                        <ModelMount>
                          <HalftoneModel
                            initialPose={levelModel.initialPose}
                            modelUrl={levelModel.modelUrl}
                            settings={levelModel.settings}
                          />
                        </ModelMount>
                      )}
                    </Visual>
                    <CardBody>
                      <PerksIntro>{i18n._(level.perksIntro)}</PerksIntro>
                      <Perks>
                        {level.perks.map((perk) => {
                          const PerkIcon = perk.icon;

                          return (
                            <li key={perk.title.id}>
                              <PerkIcon aria-hidden size={16} />
                              {i18n._(perk.title)}
                            </li>
                          );
                        })}
                      </Perks>
                    </CardBody>
                  </Card>
                </li>
              );
            })}
          </Grid>
          <LedgerRow>
            <IntegratorLedger footnote={i18n._(ledgerFootnote)} />
          </LedgerRow>
        </Measure>
      </Stack>
    </SectionShell>
  );
}
