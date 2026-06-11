'use client';

import { msg } from '@lingui/core/macro';
import { HalftoneModel } from '@/platform/visuals/rigs/halftone-model';

import { HELPED_MODEL_CONFIGS } from './helped-model-configs';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { HELPED_CARD_WIDTH_DESKTOP_PX } from './helped-card-width';

import {
  buildSchemeDeclarations,
  color,
  FONT_WEIGHT,
  fontFamily,
  radius,
  semanticColor,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Body, Button } from '@/ui';

import { type HelpedCardRecord } from './helped.data';

const SHAPE_FILL_PATH =
  'M0 490V4a4 4 0 0 1 4-4h288.23c.932 0 1.856.163 2.731.48l60.814 22.09c.875.318 1.8.48 2.731.48H439a4 4 0 0 1 4 4V490a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4';
const SHAPE_STROKE_PATH =
  'M4 .5h288.23c.874 0 1.74.152 2.561.45l60.813 22.09c.931.338 1.912.51 2.902.51H439a3.5 3.5 0 0 1 3.5 3.5V490a3.5 3.5 0 0 1-3.5 3.5H4A3.5 3.5 0 0 1 .5 490V4A3.5 3.5 0 0 1 4 .5Z';

// The card is its own dark scheme island: its text, dividers, and the CTA
// resolve from [data-scheme='dark'] context, not props.
const CardRoot = styled.article`
  ${buildSchemeDeclarations('dark')}
  color: ${semanticColor.ink};
  display: grid;
  grid-template-columns: 1fr;
  isolation: isolate;
  max-width: ${HELPED_CARD_WIDTH_DESKTOP_PX}px;
  min-height: 0;
  min-width: 0;
  padding: ${spacing(2.5)} ${spacing(4)} ${spacing(4)};
  position: relative;
  row-gap: ${spacing(2.5)};
  width: 100%;
`;

const ShapeLayer = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: -1;
`;

const WordmarkRow = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr;
  min-height: ${spacing(8)};
`;

// The old site wrapped these placeholder wordmarks in SVG <text>; plain
// styled text is the same render without the asset.
const Wordmark = styled.span`
  color: ${semanticColor.ink};
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.02em;
`;

const Rule = styled.div`
  background-color: ${color('white-40')};
  height: 1px;
  width: 100%;
`;

// The halftone model (target/spaceship/money) renders here with the
// visual-runtime wave.
const VisualShell = styled.div`
  background-color: ${color('black')};
  border-radius: ${radius(2)};
  contain: strict;
  height: 240px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const CopyBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${spacing(2)};
`;

const CardHeading = styled.h3`
  ${typeRampDeclarations('headingXs')}
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-weight: ${FONT_WEIGHT.medium};
  margin: 0;
`;

const CtaRow = styled.div`
  display: grid;
  grid-template-columns: max-content;
  justify-items: start;
  padding-top: ${spacing(1)};
`;

export function HelpedCard({ card }: { card: HelpedCardRecord }) {
  const { i18n } = useLingui();

  return (
    <CardRoot data-scheme="dark">
      <ShapeLayer aria-hidden>
        <svg
          fill="none"
          height="100%"
          preserveAspectRatio="none"
          style={{ display: 'block' }}
          viewBox="0 0 443 494"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={SHAPE_FILL_PATH} fill={color('black')} />
          <path
            d={SHAPE_STROKE_PATH}
            stroke={color('white-40')}
            strokeOpacity={0.2}
          />
        </svg>
      </ShapeLayer>
      <WordmarkRow>
        <Wordmark>{card.wordmark}</Wordmark>
      </WordmarkRow>
      <Rule aria-hidden />
      <VisualShell data-illustration={card.illustration}>
        <HalftoneModel
          initialPose={HELPED_MODEL_CONFIGS[card.illustration].initialPose}
          loading="eager"
          modelUrl={HELPED_MODEL_CONFIGS[card.illustration].modelUrl}
          settings={HELPED_MODEL_CONFIGS[card.illustration].settings}
        />
      </VisualShell>
      <Rule aria-hidden />
      <CopyBlock>
        <CardHeading>{i18n._(card.heading)}</CardHeading>
        <Body muted size="sm">
          {i18n._(card.body)}
        </Body>
      </CopyBlock>
      <CtaRow>
        <Button
          href={card.href}
          label={i18n._(msg`Read the case`)}
          variant="outlined"
        />
      </CtaRow>
    </CardRoot>
  );
}
