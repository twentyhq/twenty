'use client';

import { css } from '@linaria/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import NextImage from 'next/image';
import { type CSSProperties } from 'react';

import {
  BREAKPOINT_PX,
  color,
  EASING,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
} from '@/tokens';
import { Body, Button, Eyebrow, Heading } from '@/ui';

type MatchCardStyle = CSSProperties & {
  '--partner-card-index': number;
};

const CardArticle = styled.article`
  @keyframes partnerCardEnter {
    from {
      opacity: 0;
      transform: translate3d(0, 18px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  animation: partnerCardEnter 700ms ${EASING.standard} both;
  animation-delay: calc(var(--partner-card-index) * 90ms + 180ms);
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  isolation: isolate;
  min-height: 100%;
  overflow: hidden;
  position: relative;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;

  &:hover {
    border-color: ${semanticColor.lineStrong};
    box-shadow: ${SHADOW.card};
    transform: translateY(-2px);
  }

  ${REDUCED_MOTION} {
    animation: none;
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const AccentBar = styled.div`
  background-color: ${color('blue')};
  height: 3px;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 2;
`;

const TextureLayer = styled.div`
  bottom: 0;
  left: 30%;
  pointer-events: none;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 0;

  ${mediaUp('md')} {
    left: 20%;
  }
`;

const TextureScrim = styled.div`
  background: linear-gradient(
    118deg,
    ${color('white')} 0%,
    ${color('white')} 38%,
    ${color('white-70')} 58%,
    ${color('white-20')} 100%
  );
  inset: 0;
  position: absolute;
  z-index: 1;
`;

const textureImageClassName = css`
  object-fit: cover;
  object-position: right center;
  opacity: 0.9;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacing(5)};
  padding: ${spacing(6)};
  padding-top: calc(${spacing(6)} + 3px);
  position: relative;
  z-index: 2;
`;

const Copy = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const CtaWrapper = styled.div`
  margin-top: auto;
`;

export function MarketplaceMatchCard({ index = 0 }: { index?: number }) {
  const { i18n } = useLingui();
  const style: MatchCardStyle = { '--partner-card-index': index };

  return (
    <CardArticle style={style}>
      <AccentBar aria-hidden />
      <TextureLayer aria-hidden>
        <TextureScrim />
        <NextImage
          alt=""
          className={textureImageClassName}
          fill
          sizes={`(min-width: ${BREAKPOINT_PX.md}px) 280px, 50vw`}
          src="/images/pricing/engagement-band/halftone-on-white.webp"
        />
      </TextureLayer>
      <Content>
        <Copy>
          <Eyebrow>{i18n._(msg`Partner matching`)}</Eyebrow>
          <Heading as="h2" size="sm" weight="light">
            {i18n._(msg`Let us *match* you`)}
          </Heading>
          <Body muted size="sm">
            {i18n._(
              msg`Share your project in a few minutes. We pair you with a certified partner who fits.`,
            )}
          </Body>
        </Copy>
        <CtaWrapper>
          <Button
            href="/partners/brief"
            label={i18n._(msg`Get matched`)}
            variant="filled"
          />
        </CtaWrapper>
      </Content>
    </CardArticle>
  );
}
