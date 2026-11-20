'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { formatUsdRate } from '@/partners-marketplace/format-usd-rate';
import { MARKETPLACE_COPY } from '@/partners-marketplace/marketplace-copy';
import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { richTextExcerpt } from '@/partners-marketplace/rich-text-excerpt';
import { SERVED_GEO_LABELS } from '@/partners-marketplace/served-geo-labels';
import { SPOKEN_LANGUAGE_LABELS } from '@/partners-marketplace/spoken-language-labels';
import { SuperPartnerMark } from '@/partners-marketplace/SuperPartnerMark';
import { titleCaseFallback } from '@/partners-marketplace/title-case-fallback';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
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

import { PartnersStageMark } from './PartnersStageMark';

// One grid for every row, so name, pitch, scopes and rate read as columns.
const RowArticle = styled.article`
  @keyframes partnersStageRowEnter {
    from {
      opacity: 0;
      transform: translate3d(0, 10px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  align-items: start;
  animation: partnersStageRowEnter ${DURATION.xl} ${EASING.standard} both;
  animation-delay: calc(var(--partners-stage-index) * 35ms);
  border-bottom: 1px solid ${semanticColor.line};
  column-gap: ${spacing(4)};
  display: grid;
  grid-template-areas:
    'mark identity arrow'
    'pitch pitch pitch'
    'reach reach rate';
  grid-template-columns: auto minmax(0, 1fr) auto;
  padding: ${spacing(5)} 0;
  position: relative;

  /* The hover wash runs past the text columns without moving them. */
  &::before {
    background-color: ${color('black-5')};
    border-radius: ${radius(2)};
    content: '';
    inset: 0 calc(${spacing(4)} * -1);
    opacity: 0;
    position: absolute;
    transition: opacity ${DURATION.xxs} ${EASING.gentle};
  }

  &:hover::before {
    opacity: 1;
  }

  & > * {
    position: relative;
  }

  ${mediaUp('lg')} {
    align-items: center;
    column-gap: ${spacing(8)};
    grid-template-areas: 'mark identity pitch reach rate arrow';
    grid-template-columns:
      auto minmax(0, 230px) minmax(0, 1fr) minmax(0, 220px)
      88px auto;
    padding: ${spacing(6)} 0;
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

const MarkCell = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(1.5)};
  grid-area: mark;
  line-height: 0;
`;

const Identity = styled.div`
  align-self: center;
  grid-area: identity;
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(1.5)};
  }
`;

const PartnerName = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

// Stretched link: the name is the link, its ::after covers the row.
const NameLink = styled(LocalizedLink)`
  color: inherit;
  text-decoration: none;

  &::after {
    content: '';
    inset: 0 calc(${spacing(4)} * -1);
    position: absolute;
    z-index: 1;
  }

  &:focus-visible::after {
    border-radius: ${radius(2)};
    outline: 2px solid ${color('blue')};
  }
`;

const MonoLine = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.08em;
  line-height: 1.4;
  text-transform: uppercase;
`;

const Pitch = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: ${semanticColor.inkMuted};
  display: -webkit-box;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.75)};
  grid-area: pitch;
  line-height: 1.5;
  margin-top: ${spacing(4)};
  overflow: hidden;
  overflow-wrap: anywhere;

  ${mediaUp('lg')} {
    -webkit-line-clamp: 2;
    margin-top: 0;
  }
`;

const Reach = styled.div`
  grid-area: reach;
  margin-top: ${spacing(4)};
  min-width: 0;

  & > * + * {
    margin-top: ${spacing(1.5)};
  }

  ${mediaUp('lg')} {
    margin-top: 0;
  }
`;

const ReachLine = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 1.4;
`;

const Rate = styled.p`
  align-self: end;
  color: ${semanticColor.ink};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3.25)};
  grid-area: rate;
  letter-spacing: 0.02em;
  text-align: right;
  white-space: nowrap;

  ${mediaUp('lg')} {
    align-self: center;
  }
`;

const Arrow = styled.span`
  align-self: center;
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(4)};
  grid-area: arrow;
  transition:
    color ${DURATION.xs} ${EASING.gentle},
    transform ${DURATION.xs} ${EASING.standard};

  article:hover > & {
    color: ${color('blue')};
    transform: translate3d(4px, 0, 0);
  }

  ${REDUCED_MOTION} {
    transition: none;

    article:hover > & {
      transform: none;
    }
  }
`;

type PartnersStagePartnerRowProps = {
  index: number;
  partner: MarketplacePartner;
};

// PROTOTYPE
export function PartnersStagePartnerRow({
  index,
  partner,
}: PartnersStagePartnerRowProps) {
  const { i18n } = useLingui();
  const headingId = `partners-stage-row-${partner.slug}`;

  const locationLine = [
    partner.city,
    partner.country ? titleCaseFallback(partner.country) : '',
  ]
    .filter(Boolean)
    .join(', ');
  // Unknown CRM values (added before the site syncs) fall back to title case.
  const regionLine = partner.region
    .map((geo) =>
      geo in SERVED_GEO_LABELS
        ? i18n._(SERVED_GEO_LABELS[geo])
        : titleCaseFallback(geo),
    )
    .join(' · ');
  const languageLine = partner.languagesSpoken
    .map((language) =>
      language in SPOKEN_LANGUAGE_LABELS
        ? i18n._(SPOKEN_LANGUAGE_LABELS[language])
        : titleCaseFallback(language),
    )
    .join(', ');
  const hourly = formatUsdRate(partner.hourlyRateUsd);

  return (
    <RowArticle
      aria-labelledby={headingId}
      style={{ ['--partners-stage-index' as string]: Math.min(index, 12) }}
    >
      <MarkCell>
        <PartnersStageMark
          markUrl={partner.profilePictureUrl}
          name={partner.name}
          sizePx={48}
        />
      </MarkCell>
      <Identity>
        {partner.superPartner ? (
          <SuperPartnerMark label={i18n._(MARKETPLACE_COPY.superPartner)} />
        ) : null}
        <PartnerName id={headingId}>
          <NameLink href={`/partners/profile/${partner.slug}`}>
            {partner.name}
          </NameLink>
        </PartnerName>
        {locationLine.length > 0 && <MonoLine>{locationLine}</MonoLine>}
      </Identity>
      <Pitch>{richTextExcerpt(partner.description)}</Pitch>
      <Reach>
        {regionLine.length > 0 && <MonoLine>{regionLine}</MonoLine>}
        {languageLine.length > 0 && <ReachLine>{languageLine}</ReachLine>}
      </Reach>
      <Rate>{hourly !== null && i18n._(msg`${hourly}/hr`)}</Rate>
      <Arrow aria-hidden>→</Arrow>
    </RowArticle>
  );
}
