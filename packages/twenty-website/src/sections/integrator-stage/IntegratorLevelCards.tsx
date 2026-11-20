import { styled } from '@linaria/react';
import { type MessageDescriptor } from '@lingui/core';
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
import { SectionShell } from '@/ui';

import { INTEGRATOR_CLOSING_MODEL } from './integrator-closing-model-settings';
import { type IntegratorLevel } from './integrator-level.type';
import { IntegratorLedger } from './IntegratorLedger';

// The /apps grid: fixed columns, two level cards and the ledger in the third.
const Grid = styled.ul`
  display: grid;
  gap: ${spacing(3)};
  grid-template-columns: minmax(0, 1fr);
  list-style: none;
  padding: 0;

  ${mediaUp('sm')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${mediaUp('md')} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

// The /apps card frame: hairline, radius 2, staggered entrance. Not a link.
const Card = styled.article`
  animation: integrator-level-card-in ${DURATION.xl} ${EASING.standard}
    backwards;
  animation-delay: calc(var(--card-index) * 80ms);
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
  isolation: isolate;
  overflow: hidden;
  position: relative;
  text-decoration: none;

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

// PROTOTYPE: slot for the level's 3D logo, to be made by Thomas; the page's
// green money model holds the place until then. Same
// place and height as the halftone band on the /apps cards.
const ModelSlot = styled.div`
  align-items: center;
  display: flex;
  height: 160px;
  justify-content: center;

  ${mediaUp('md')} {
    height: 200px;
  }
`;

const ModelMount = styled.div`
  aspect-ratio: 1 / 1;
  height: 100%;
`;

const CardBody = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${spacing(10)};
  justify-content: space-between;
  padding: ${spacing(6)};
`;

const Top = styled.div`
  & > * + * {
    margin-top: ${spacing(1.5)};
  }
`;

const LevelLabel = styled.p`
  align-items: center;
  color: ${semanticColor.inkMuted};
  column-gap: ${spacing(2)};
  display: flex;
  font-family: ${fontFamily('mono')};
  font-size: 11px;
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.06em;
  margin-bottom: ${spacing(4)};
  text-transform: uppercase;

  /* The open level carries the page's one green touch. */
  &[data-open]::before {
    background-color: ${color('green')};
    content: '';
    height: 6px;
    width: 6px;
  }
`;

const Title = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 24px;
`;

const Tagline = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 22px;
`;

const Perks = styled.ul`
  flex: 1 1 auto;
  list-style: none;
  padding: 0;

  & > li {
    align-items: center;
    color: ${semanticColor.ink};
    column-gap: ${spacing(3)};
    display: flex;
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(3.5)};
    line-height: 22px;
    padding-block: ${spacing(1.5)};
  }

  & > li > svg {
    color: ${color('blue')};
    flex-shrink: 0;
  }
`;

const Headline = styled.p`
  align-items: baseline;
  color: ${semanticColor.ink};
  column-gap: ${spacing(2)};
  display: flex;
  flex-wrap: wrap;
  font-family: ${fontFamily('serif')};
  font-size: ${fontSize(10)};
  font-weight: ${FONT_WEIGHT.light};
  letter-spacing: -0.02em;
  line-height: 1;

  & > span {
    color: ${semanticColor.inkMuted};
    font-family: ${fontFamily('mono')};
    font-size: 11px;
    font-weight: ${FONT_WEIGHT.medium};
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
`;

// The third column: the ledger prices the levels beside it.
const LedgerCell = styled.li`
  ${mediaUp('sm')} {
    grid-column: 1 / -1;
  }

  ${mediaUp('md')} {
    grid-column: auto;
  }
`;

type CardStyle = CSSProperties & { '--card-index': number };

type IntegratorLevelCardsProps = {
  levels: readonly IntegratorLevel[];
  ledgerFootnote: MessageDescriptor;
};

// PROTOTYPE direction d: the levels, short, as section 2 (Thomas, 2026-11-18);
// the full detail comes back further down.
export function IntegratorLevelCards({
  levels,
  ledgerFootnote,
}: IntegratorLevelCardsProps) {
  const i18n = getServerI18n();

  return (
    <SectionShell scheme="dark">
      <Grid>
        {levels.map((level, index) => {
          const style: CardStyle = { '--card-index': index };

          return (
            <li key={level.title.id}>
              <Card style={style}>
                <ModelSlot
                  aria-hidden
                  data-model-slot={`integrator-level-${index + 1}`}
                >
                  <ModelMount>
                    <HalftoneModel
                      initialPose={INTEGRATOR_CLOSING_MODEL.initialPose}
                      modelUrl={INTEGRATOR_CLOSING_MODEL.modelUrl}
                      settings={INTEGRATOR_CLOSING_MODEL.settings}
                    />
                  </ModelMount>
                </ModelSlot>
                <CardBody>
                  <Top>
                    <LevelLabel
                      data-open={isDefined(level.requirement) ? undefined : ''}
                    >
                      {i18n._(level.label)}
                    </LevelLabel>
                    <Title>{i18n._(level.title)}</Title>
                    <Tagline>{i18n._(level.tagline)}</Tagline>
                  </Top>
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
                  <Headline>
                    {i18n._(level.headline)}
                    {isDefined(level.headlineSuffix) && (
                      <span>{i18n._(level.headlineSuffix)}</span>
                    )}
                  </Headline>
                </CardBody>
              </Card>
            </li>
          );
        })}
        <LedgerCell>
          <IntegratorLedger footnote={i18n._(ledgerFootnote)} />
        </LedgerCell>
      </Grid>
    </SectionShell>
  );
}
