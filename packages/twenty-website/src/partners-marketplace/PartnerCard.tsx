'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

import { CardFrame, type PartnerCardIndexStyle } from './MarketplaceCardFrame';
import { type MarketplacePartner } from './marketplace-partner';
import { PartnerAvatar } from './PartnerAvatar';
import { resolvePartnerScopeCards } from './resolve-partner-scope-cards';
import { richTextExcerpt } from './rich-text-excerpt';
import { titleCaseFallback } from './title-case-fallback';

const CardArticle = styled(CardFrame)`
  gap: ${spacing(3.5)};
  padding: ${spacing(5.5)} ${spacing(5.5)} ${spacing(4.5)};
  will-change: transform;
`;

const CardTop = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing(3.25)};
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(0.75)};
  }
`;

const PartnerName = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.25)};
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.2;
`;

// The card's whole-surface link uses the "stretched link" pattern: an inline
// <a> on the name with an absolutely-positioned ::after that covers the
// entire <article>.
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

const LocationEyebrow = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.625)};
  letter-spacing: 0.1em;
  line-height: 1.2;
  text-transform: uppercase;
`;

const CardIntro = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: ${semanticColor.inkMuted};
  display: -webkit-box;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.625)};
  line-height: 1.5;
  overflow: hidden;
  overflow-wrap: anywhere;
`;

const CardFoot = styled.div`
  align-items: center;
  border-top: 1px solid ${semanticColor.line};
  display: flex;
  gap: ${spacing(3.5)};
  justify-content: space-between;
  margin-top: ${spacing(0.5)};
  padding-top: ${spacing(3.5)};
`;

const ScopeLine = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: ${semanticColor.inkMuted};
  display: -webkit-box;
  flex: 1;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
`;

const CardCta = styled.span`
  align-items: center;
  color: ${color('blue')};
  display: inline-flex;
  flex: 0 0 auto;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  gap: ${spacing(1.25)};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
`;

type PartnerCardProps = {
  partner: MarketplacePartner;
  index: number;
};

export function PartnerCard({ partner, index }: PartnerCardProps) {
  const { i18n } = useLingui();
  const headingId = `partner-card-heading-${partner.slug}`;
  const style: PartnerCardIndexStyle = { '--partner-card-index': index };
  // Unprefixed; LocalizedLink (the name link) adds the locale.
  const profileHref = `/partners/profile/${partner.slug}`;

  const locationLine = [
    partner.city,
    partner.country ? titleCaseFallback(partner.country) : '',
  ]
    .filter(Boolean)
    .join(', ');

  const scopeCards = resolvePartnerScopeCards(partner.partnerScope);
  const scopeLine = scopeCards.map((scope) => i18n._(scope.label)).join(' · ');

  const descriptionExcerpt = richTextExcerpt(partner.description);

  return (
    <CardArticle aria-labelledby={headingId} style={style}>
      <CardTop>
        <PartnerAvatar
          name={partner.name}
          slug={partner.slug}
          profilePictureUrl={partner.profilePictureUrl}
        />
        <HeaderText>
          <PartnerName id={headingId}>
            <NameLink href={profileHref}>{partner.name}</NameLink>
          </PartnerName>
          {locationLine.length > 0 && (
            <LocationEyebrow>{locationLine}</LocationEyebrow>
          )}
        </HeaderText>
      </CardTop>

      <CardIntro>{descriptionExcerpt}</CardIntro>

      <CardFoot>
        {scopeLine.length > 0 && (
          <ScopeLine title={scopeLine}>{scopeLine}</ScopeLine>
        )}
        <CardCta>{i18n._(msg`View profile`)} →</CardCta>
      </CardFoot>
    </CardArticle>
  );
}
