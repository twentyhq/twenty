'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  CardFrame,
  type PartnerCardIndexStyle,
} from '@/partners-marketplace/MarketplaceCardFrame';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

import { useSearchParams } from 'next/navigation';

import { AppLogo } from './AppLogo';
// PROTOTYPE (?shape=notched): remove with NotchedFrame.
import { NotchedFrame } from './NotchedFrame';
import { type MarketplaceApp } from './marketplace-app';

const CardArticle = styled(CardFrame)`
  gap: ${spacing(3.5)};
  padding: ${spacing(5.5)} ${spacing(5.5)} ${spacing(4.5)};
  will-change: transform;
`;

const NotchedArticle = styled.article`
  display: flex;
  flex-direction: column;
  isolation: isolate;
  position: relative;
`;

const NotchedContent = styled(NotchedFrame)`
  gap: ${spacing(3.5)};
  padding: ${spacing(1.5)} ${spacing(5.5)} ${spacing(4.5)};
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
    margin-top: ${spacing(0.75)};
  }
`;

const AppName = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.25)};
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.2;
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
  font-size: ${fontSize(3.625)};
  line-height: 1.5;
  overflow: hidden;
`;

const CardFoot = styled.div`
  align-items: center;
  border-top: 1px solid ${semanticColor.line};
  display: flex;
  gap: ${spacing(3.5)};
  justify-content: space-between;
  margin-top: auto;
  padding-top: ${spacing(3.5)};
`;

const AuthorLine = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 1.4;
`;

const CardCta = styled.span`
  color: ${color('blue')};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
`;

type AppCardProps = {
  app: MarketplaceApp;
  index: number;
};

export function AppCard({ app, index }: AppCardProps) {
  const { i18n } = useLingui();
  const headingId = `app-card-heading-${app.slug}`;
  const style: PartnerCardIndexStyle = { '--partner-card-index': index };
  const detailHref = `/apps/${app.slug}`;

  const isNotched = useSearchParams().get('shape') === 'notched';
  const content = (
    <>
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

      <CardFoot>
        <AuthorLine>{i18n._(msg`By ${app.author}`)}</AuthorLine>
        <CardCta>{i18n._(msg`View app`)} →</CardCta>
      </CardFoot>
    </>
  );

  if (isNotched) {
    return (
      <NotchedArticle aria-labelledby={headingId}>
        <NotchedContent>{content}</NotchedContent>
      </NotchedArticle>
    );
  }

  return (
    <CardArticle aria-labelledby={headingId} style={style}>
      {content}
    </CardArticle>
  );
}
