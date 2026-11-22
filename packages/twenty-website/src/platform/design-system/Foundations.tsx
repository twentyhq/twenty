'use client';

import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { useState, type ReactNode } from 'react';

import {
  BREAKPOINT_PX,
  DURATION,
  EASING,
  FONT_WEIGHT,
  GUTTER,
  MAX_CONTENT_WIDTH_PX,
  PALETTE,
  REDUCED_MOTION,
  RHYTHM,
  SCHEMES,
  SHADOW,
  TYPE_SCALE,
  UNITS,
  Z_INDEX,
  color,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
  typeRampDeclarations,
  type FontFamilyToken,
  type PaletteToken,
  type Scheme,
} from '@/tokens';
import { ALPHA_SCALE, type AlphaStep } from '@/tokens/alpha-scale';
import { Button, NotchedCardShape, SectionShell } from '@/ui';

import COMPONENT_DOCS from './component-docs.json';

import { Block } from './Block';
import { Code } from './Code';
import { DocSection } from './DocSection';
import { Frame } from './Frame';
import { Grid } from './Grid';
import { Label } from './Label';
import { Meta } from './Meta';
import { Row } from './Row';
import { SubHead } from './SubHead';
import { Table } from './Table';
import { TableScroll } from './TableScroll';

const px = (multiplier: number, basePx: number) => `${multiplier * basePx}px`;
type TopicProps = { asPage?: boolean };

const SITE_TOKENS = COMPONENT_DOCS.tokens;
const FONT_BASE_PX = UNITS.fontBaseRem * SITE_TOKENS.rootFontSizePx;

const Swatch = styled.div`
  aspect-ratio: 3 / 2;
  border-radius: ${radius(2)};
  box-shadow: inset 0 0 0 1px ${semanticColor.line};
  max-width: 100%;
`;

function Colors({ asPage }: TopicProps) {
  return (
    <DocSection
      asPage={asPage}
      id="colors"
      eyebrow="Foundations"
      title="Colors"
      intro="Raw values live in PALETTE and the alpha scale. Components read roles through semanticColor, which each section resolves with its scheme."
    >
      <Block>
        <SubHead>Palette</SubHead>
        <Grid min={140}>
          {(Object.keys(PALETTE) as PaletteToken[]).map((token) => (
            <Meta key={token}>
              <Swatch style={{ background: color(token) }} />
              <Label>{token}</Label>
              <Code>{PALETTE[token]}</Code>
              <Code>--color-{token}</Code>
            </Meta>
          ))}
        </Grid>
      </Block>
      <Block>
        <SubHead>Alpha scale</SubHead>
        {ALPHA_SCALE.colors.map((base) => (
          <Grid key={base} min={88}>
            {(Object.keys(ALPHA_SCALE.stepHex) as unknown as AlphaStep[]).map(
              (step) => (
                <Meta key={step}>
                  <Swatch style={{ background: color(`${base}-${step}`) }} />
                  <Code>
                    {base}-{step}
                  </Code>
                </Meta>
              ),
            )}
          </Grid>
        ))}
      </Block>
    </DocSection>
  );
}

const SchemeRole = styled.div`
  align-items: center;
  border-bottom: 1px solid ${semanticColor.line};
  display: flex;
  gap: ${spacing(3)};
  padding-block: ${spacing(2)};
`;

const RoleChip = styled.span`
  border-radius: ${radius(1)};
  box-shadow: inset 0 0 0 1px ${semanticColor.lineStrong};
  flex-shrink: 0;
  height: ${spacing(6)};
  width: ${spacing(6)};
`;

const SchemePanel = styled.div`
  padding-block: ${spacing(6)};
`;

function Schemes({ asPage }: TopicProps) {
  const schemes = Object.keys(SCHEMES) as Scheme[];
  const roles = Object.keys(SCHEMES.light) as (keyof typeof semanticColor)[];

  return (
    <DocSection
      asPage={asPage}
      id="schemes"
      eyebrow="Foundations"
      title="Schemes"
      intro="A section picks its scheme on SectionShell. The same component, reading the same roles, adapts to each one."
    >
      <Grid min={260}>
        {schemes.map((scheme) => (
          <Frame key={scheme}>
            <SectionShell flushInline rhythm="flush" scheme={scheme}>
              <SchemePanel>
                <Block>
                  <SubHead>{scheme}</SubHead>
                  <div>
                    {roles.map((role) => (
                      <SchemeRole key={role}>
                        <RoleChip style={{ background: semanticColor[role] }} />
                        <Label style={{ color: semanticColor.ink }}>
                          {role}
                        </Label>
                        <Code>{SCHEMES[scheme][role]}</Code>
                      </SchemeRole>
                    ))}
                  </div>
                </Block>
              </SchemePanel>
            </SectionShell>
          </Frame>
        ))}
      </Grid>
    </DocSection>
  );
}

const RAMP_CLASS: Record<keyof typeof TYPE_SCALE, string> = {
  display: css`
    ${typeRampDeclarations('display')}
  `,
  headingXl: css`
    ${typeRampDeclarations('headingXl')}
  `,
  headingLg: css`
    ${typeRampDeclarations('headingLg')}
  `,
  headingMd: css`
    ${typeRampDeclarations('headingMd')}
  `,
  headingSm: css`
    ${typeRampDeclarations('headingSm')}
  `,
  headingXs: css`
    ${typeRampDeclarations('headingXs')}
  `,
  eyebrow: css`
    ${typeRampDeclarations('eyebrow')}
  `,
  bodyMd: css`
    ${typeRampDeclarations('bodyMd')}
  `,
  bodySm: css`
    ${typeRampDeclarations('bodySm')}
  `,
  bodyXs: css`
    ${typeRampDeclarations('bodyXs')}
  `,
};

const FAMILIES = SITE_TOKENS.fontFamilies as FontFamilyToken[];

const Specimen = styled.div`
  color: ${semanticColor.ink};
  overflow-wrap: anywhere;
`;

const RampRow = styled.div`
  border-bottom: 1px solid ${semanticColor.line};
  display: grid;
  gap: ${spacing(2)};
  padding-block: ${spacing(4)};
`;

function Typography({ asPage }: TopicProps) {
  return (
    <DocSection
      asPage={asPage}
      id="typography"
      eyebrow="Foundations"
      title="Typography"
      intro="Families loaded with next/font. Sizes are multiples of the font base unit; fluid ramps grow between the smallest viewport and the md breakpoint. Each ramp is shown in the family of the component that renders it."
    >
      <Block>
        <SubHead>Families</SubHead>
        <Grid min={220}>
          {FAMILIES.map((family) => (
            <Meta key={family}>
              <Specimen
                style={{
                  fontFamily: fontFamily(family),
                  fontSize: fontSize(16),
                  lineHeight: 1,
                }}
              >
                Aa
              </Specimen>
              <Label>{family}</Label>
              <Code>{fontFamily(family)}</Code>
            </Meta>
          ))}
        </Grid>
      </Block>
      <Block>
        <SubHead>Weights</SubHead>
        {FAMILIES.map((family) => (
          <Row key={family}>
            {Object.entries(FONT_WEIGHT).map(([name, weight]) => (
              <Meta key={name}>
                <Specimen
                  style={{
                    fontFamily: fontFamily(family),
                    fontSize: fontSize(7),
                    fontWeight: weight,
                  }}
                >
                  Twenty
                </Specimen>
                <Code>
                  {family} · {name} {weight}
                </Code>
              </Meta>
            ))}
          </Row>
        ))}
      </Block>
      <Block>
        <SubHead>Type scale</SubHead>
        <div>
          {(Object.keys(TYPE_SCALE) as (keyof typeof TYPE_SCALE)[]).map(
            (ramp) => {
              const { base, md } = TYPE_SCALE[ramp];
              const isRunningText = base.lineHeight === null;
              // The family the code pairs the ramp with; when it pairs it
              // with several and no default, the specimen shows each one.
              const reading =
                SITE_TOKENS.rampFamily[
                  ramp as keyof typeof SITE_TOKENS.rampFamily
                ];
              const families = (
                reading?.family ? [reading.family] : (reading?.families ?? [])
              ) as FontFamilyToken[];
              return (
                <RampRow key={ramp}>
                  <Code>
                    {ramp} · {families.join(' or ') || 'no family read'} ·{' '}
                    {px(base.size, FONT_BASE_PX)}
                    {base.size === md.size
                      ? ''
                      : ` → ${px(md.size, FONT_BASE_PX)}`}
                  </Code>
                  {families.map((family) => (
                    <Specimen
                      key={family}
                      className={RAMP_CLASS[ramp]}
                      style={{ fontFamily: fontFamily(family) }}
                    >
                      {isRunningText
                        ? 'Twenty is the CRM you build on.'
                        : 'Build your CRM'}
                    </Specimen>
                  ))}
                </RampRow>
              );
            },
          )}
        </div>
      </Block>
    </DocSection>
  );
}

const Bar = styled.div`
  background: ${color('blue')};
  border-radius: ${radius(1)};
  height: ${spacing(3)};
`;

const RadiusBox = styled.div`
  background: ${semanticColor.line};
  border: 1px solid ${semanticColor.lineStrong};
  height: ${spacing(20)};
  max-width: 100%;
  width: ${spacing(28)};
`;

const ShadowBox = styled.div`
  background: ${color('white')};
  border-radius: ${radius(2)};
  height: ${spacing(24)};
`;

const SPACING_STEPS = SITE_TOKENS.spacingSteps;
const RADIUS_STEPS = SITE_TOKENS.radiusSteps;

function Layout({ asPage }: TopicProps) {
  return (
    <DocSection
      asPage={asPage}
      id="space-and-shape"
      eyebrow="Foundations"
      title="Space and shape"
      intro="spacing(n) and radius(n) multiply their base unit. Sections take their vertical padding from RHYTHM and their side padding from GUTTER, never their own numbers."
    >
      <Block>
        <SubHead>
          spacing(n) used on the site, base {UNITS.spacingBasePx}px
        </SubHead>
        <div>
          {SPACING_STEPS.map((step) => (
            <Row key={step}>
              <Code style={{ width: spacing(24) }}>
                spacing({step}) · {px(step, UNITS.spacingBasePx)}
              </Code>
              <Bar style={{ width: spacing(step) }} />
            </Row>
          ))}
        </div>
      </Block>
      <Block>
        <SubHead>Rhythm and frame</SubHead>
        <TableScroll>
          <Table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Mobile</th>
                <th>Desktop</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(RHYTHM).map(([name, value]) => (
                <tr key={name}>
                  <td>
                    <Code>RHYTHM.{name}</Code>
                  </td>
                  <td>{px(value.top.base, UNITS.spacingBasePx)}</td>
                  <td>{px(value.top.md, UNITS.spacingBasePx)}</td>
                </tr>
              ))}
              <tr>
                <td>
                  <Code>GUTTER</Code>
                </td>
                <td>{px(GUTTER.base, UNITS.spacingBasePx)}</td>
                <td>{px(GUTTER.md, UNITS.spacingBasePx)}</td>
              </tr>
              <tr>
                <td>
                  <Code>MAX_CONTENT_WIDTH_PX</Code>
                </td>
                <td colSpan={2}>{MAX_CONTENT_WIDTH_PX}px</td>
              </tr>
            </tbody>
          </Table>
        </TableScroll>
      </Block>
      <Block>
        <SubHead>
          radius(n) used on the site, base {UNITS.radiusBasePx}px
        </SubHead>
        <Row>
          {RADIUS_STEPS.map((step) => (
            <Meta key={step}>
              <RadiusBox style={{ borderRadius: radius(step) }} />
              <Code>
                radius({step}) · {px(step, UNITS.radiusBasePx)}
              </Code>
            </Meta>
          ))}
        </Row>
      </Block>
      <Block>
        <SubHead>Notch</SubHead>
        <Grid min={260}>
          {(['light', 'dark'] as Scheme[]).map((scheme) => (
            <Frame key={scheme} style={{ height: spacing(40) }}>
              <NotchedCardShape cardScheme={scheme} />
            </Frame>
          ))}
        </Grid>
      </Block>
      <Block>
        <SubHead>Shadows</SubHead>
        <Grid min={200}>
          {Object.entries(SHADOW).map(([name, value]) => (
            <Meta key={name}>
              <ShadowBox style={{ boxShadow: value }} />
              <Label>SHADOW.{name}</Label>
              <Code>{value}</Code>
            </Meta>
          ))}
        </Grid>
      </Block>
    </DocSection>
  );
}

const Track = styled.div`
  container-type: inline-size;
  border-bottom: 1px solid ${semanticColor.line};
  height: ${spacing(8)};
  position: relative;
`;

const Dot = styled.span`
  background: ${color('blue')};
  border-radius: 50%;
  height: ${spacing(4)};
  left: 0;
  position: absolute;
  top: ${spacing(2)};
  width: ${spacing(4)};

  ${REDUCED_MOTION} {
    transition: none !important;
  }
`;

function Motion({ asPage }: TopicProps) {
  const [played, setPlayed] = useState(false);

  return (
    <DocSection
      asPage={asPage}
      id="motion"
      eyebrow="Foundations"
      title="Motion"
      intro="Pair a DURATION with an EASING. Every animated component carries a REDUCED_MOTION block."
    >
      <Row>
        <Button
          label={played ? 'Reset' : 'Play'}
          size="small"
          variant="outlined"
          onClick={() => setPlayed(!played)}
        />
        <Code>DURATION.xl · {DURATION.xl}</Code>
      </Row>
      <Block>
        <SubHead>Easings</SubHead>
        {Object.entries(EASING).map(([name, value]) => (
          <Meta key={name}>
            <Code>
              EASING.{name} · {value}
            </Code>
            <Track>
              <Dot
                style={{
                  transform: played
                    ? `translateX(calc(100cqw - ${spacing(4)}))`
                    : 'none',
                  transition: `transform ${DURATION.xl} ${value}`,
                }}
              />
            </Track>
          </Meta>
        ))}
      </Block>
      <Block>
        <SubHead>Durations</SubHead>
        <TableScroll>
          <Table>
            <tbody>
              {Object.entries(DURATION).map(([name, value]) => (
                <tr key={name}>
                  <td>
                    <Code>DURATION.{name}</Code>
                  </td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableScroll>
      </Block>
    </DocSection>
  );
}

function Breakpoints({ asPage }: TopicProps) {
  return (
    <DocSection
      asPage={asPage}
      id="breakpoints-and-layers"
      eyebrow="Foundations"
      title="Breakpoints and layers"
      intro="Breakpoints exist only through mediaUp(), min-width only. Stacking goes through Z_INDEX."
    >
      <TableScroll>
        <Table>
          <tbody>
            {Object.entries(BREAKPOINT_PX).map(([name, value]) => (
              <tr key={name}>
                <td>
                  <Code>mediaUp(&apos;{name}&apos;)</Code>
                </td>
                <td>{value}px</td>
              </tr>
            ))}
            {Object.entries(Z_INDEX).map(([name, value]) => (
              <tr key={name}>
                <td>
                  <Code>Z_INDEX.{name}</Code>
                </td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableScroll>
    </DocSection>
  );
}

const TOPICS: Record<string, (props: TopicProps) => ReactNode> = {
  colors: Colors,
  schemes: Schemes,
  typography: Typography,
  'space-and-shape': Layout,
  motion: Motion,
  'breakpoints-and-layers': Breakpoints,
};

export function FoundationTopic({
  topic,
  asPage = false,
}: {
  topic: string;
  asPage?: boolean;
}) {
  const Topic = TOPICS[topic];
  return Topic ? <Topic asPage={asPage} /> : null;
}
