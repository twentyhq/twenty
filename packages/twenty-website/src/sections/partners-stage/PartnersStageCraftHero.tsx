'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import {
  color,
  DURATION,
  EASING,
  fontFamily,
  fontSize,
  mediaUp,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';
import { Heading, SectionShell } from '@/ui';

import { PARTNERS_STAGE_CRAFT_COLUMN } from './partners-stage-craft-column';
import { PartnersStageCraftHalftone } from './PartnersStageCraftHalftone';
import { PartnersStageCraftRing } from './PartnersStageCraftRing';

// PROTOTYPE (?direction=e): the /apps cover with the partners' marks on the
// ring. Copy centred in the page column.
const Backdrop = styled.div`
  background-image: radial-gradient(
    ellipse 60% 55% at 50% 100%,
    ${color('white-5')},
    transparent
  );
  border-bottom: 1px solid ${semanticColor.line};
  inset: 0;
  position: absolute;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  height: 780px;
  padding: ${spacing(16)} ${spacing(4)} 0;
  ${PARTNERS_STAGE_CRAFT_COLUMN}

  ${mediaUp('sm')} {
    height: 800px;
  }

  ${mediaUp('md')} {
    height: 880px;
    padding-top: ${spacing(30)};
  }
`;

const Copy = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

const Label = styled.p`
  animation: partners-stage-craft-rise ${DURATION.xl} ${EASING.standard} both;
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  letter-spacing: 0.08em;
  line-height: 16px;
  text-transform: uppercase;

  @keyframes partners-stage-craft-rise {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const Title = styled.div`
  animation: partners-stage-craft-rise ${DURATION.xl} ${EASING.standard} 80ms
    both;
  color: ${color('neutral')};
  max-width: 820px;

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const Lede = styled.p`
  animation: partners-stage-craft-rise ${DURATION.xl} ${EASING.standard} 160ms
    both;
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: 1.55;
  max-width: 500px;

  ${mediaUp('md')} {
    font-size: ${fontSize(4.5)};
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const Actions = styled.div`
  animation: partners-stage-craft-rise ${DURATION.xl} ${EASING.standard} 240ms
    both;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: center;

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

type PartnersStageCraftHeroProps = {
  actions: ReactNode;
  markUrls: readonly string[];
};

export function PartnersStageCraftHero({
  actions,
  markUrls,
}: PartnersStageCraftHeroProps) {
  const { i18n } = useLingui();

  return (
    <SectionShell
      background={
        <>
          <Backdrop />
          <PartnersStageCraftHalftone />
          <PartnersStageCraftRing markUrls={markUrls} />
        </>
      }
      flushInline
      fullBleedBackground
      rhythm="flush"
      scheme="dark"
    >
      <Column>
        <Copy>
          <Label>{i18n._(msg`Certified partners`)}</Label>
          <Title>
            <Heading as="h1" size="xl" weight="light">
              {i18n._(msg`Hire the people who *build on Twenty*`)}
            </Heading>
          </Title>
          <Lede>
            {i18n._(
              msg`Certified partners who set up your CRM to match how your company works, from the migration to the custom apps.`,
            )}
          </Lede>
          <Actions>{actions}</Actions>
        </Copy>
      </Column>
    </SectionShell>
  );
}
