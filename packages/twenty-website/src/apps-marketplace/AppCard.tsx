'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  color,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  REDUCED_MOTION,
  semanticColor,
  SHADOW,
  spacing,
} from '@/tokens';
import { Button } from '@/ui';

import { AppLogo } from './AppLogo';
import { buildAppInstallUrl } from './build-app-install-url';
import { type MarketplaceApp } from './marketplace-app';

type AppCardStyle = CSSProperties & {
  '--app-card-index': number;
};

const CardArticle = styled.article`
  @keyframes appCardEnter {
    from {
      opacity: 0;
      transform: translate3d(0, 18px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  animation: appCardEnter 700ms ${EASING.standard} both;
  animation-delay: calc(var(--app-card-index) * 90ms + 180ms);
  background-color: ${color('white')};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${spacing(5)};
  isolation: isolate;
  padding: ${spacing(6)};
  position: relative;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
  will-change: transform;

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

const CardHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(4)};
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(1)};
  }
`;

const AppName = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('serif')};
  font-size: ${fontSize(6)};
  font-weight: ${FONT_WEIGHT.light};
  letter-spacing: -0.02em;
  line-height: ${fontSize(7)};
`;

const NameLink = styled(LocalizedLink)`
  color: inherit;
  text-decoration: none;

  &::after {
    border-radius: ${radius(2)};
    content: '';
    inset: 0;
    position: absolute;
    z-index: 0;
  }

  &:focus-visible::after {
    outline: 2px solid ${semanticColor.ink};
    outline-offset: 4px;
  }
`;

const CategoryEyebrow = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.08em;
  line-height: ${fontSize(4)};
  text-transform: uppercase;
`;

const Tagline = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: ${semanticColor.inkMuted};
  display: -webkit-box;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  line-height: ${fontSize(5.5)};
  overflow: hidden;
`;

const CtaRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(4)};
  margin-top: auto;
  position: relative;
  z-index: 1;
`;

const LearnMoreLink = styled(LocalizedLink)`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: 0.02em;
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.2s ease;

  &:hover {
    color: ${semanticColor.ink};
  }
`;

type AppCardProps = {
  app: MarketplaceApp;
  index: number;
};

export function AppCard({ app, index }: AppCardProps) {
  const { i18n } = useLingui();
  const headingId = `app-card-heading-${app.slug}`;
  const style: AppCardStyle = { '--app-card-index': index };
  const detailHref = `/apps/${app.slug}`;

  return (
    <CardArticle aria-labelledby={headingId} style={style}>
      <CardHeader>
        <AppLogo name={app.name} logoUrl={app.logoUrl} />
        <HeaderText>
          <AppName id={headingId}>
            <NameLink href={detailHref}>{app.name}</NameLink>
          </AppName>
          {app.category.length > 0 && (
            <CategoryEyebrow>{app.category}</CategoryEyebrow>
          )}
        </HeaderText>
      </CardHeader>

      <Tagline>{app.tagline}</Tagline>

      <CtaRow>
        <Button
          href={buildAppInstallUrl(app.universalIdentifier)}
          label={i18n._(msg`Install`)}
          variant="filled"
          size="small"
        />
        <LearnMoreLink
          href={detailHref}
          aria-label={i18n._(msg`Learn more about ${app.name}`)}
        >
          {i18n._(msg`Learn more`)}
        </LearnMoreLink>
      </CtaRow>
    </CardArticle>
  );
}
