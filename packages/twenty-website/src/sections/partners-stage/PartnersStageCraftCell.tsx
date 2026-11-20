'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { richTextExcerpt } from '@/partners-marketplace/rich-text-excerpt';
import { type ServedGeo } from '@/partners-marketplace/served-geos';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import {
  color,
  DURATION,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  MENU_HEIGHT_PX,
  mediaUp,
  radius,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';

import { describePartnersStagePartner } from './describe-partners-stage-partner';
import { PARTNERS_STAGE_REGION_ACCENT } from './partners-stage-region-accent';
import { PARTNERS_STAGE_REGION_CENTER } from './partners-stage-region-center.data';
import { PartnersStageMark } from './PartnersStageMark';
import { PartnersStageRegionCover } from './PartnersStageRegionCover';
import { resolvePartnerCoordinates } from './resolve-partner-coordinates';

// PROTOTYPE (?direction=e): a partner card on the /apps card
// (apps-marketplace/AppsStageAppCards): a decorative band on top (here the
// dotted map around the partner's base, in the region's accent), then the
// logo, the name, the pitch, and the price and languages to compare. On
// hover a fill slides in from the left and the logo springs up.
const Card = styled.article`
  animation: partners-stage-craft-cell-in ${DURATION.xl} ${EASING.standard}
    backwards;
  animation-delay: calc(var(--partners-stage-cell-index) * 80ms);
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  display: flex;
  flex-direction: column;
  height: 100%;
  isolation: isolate;
  overflow: hidden;
  position: relative;
  scroll-margin-top: ${MENU_HEIGHT_PX + 96}px;

  &::before {
    background-color: ${color('white-5')};
    content: '';
    inset: 0;
    position: absolute;
    transform: translateX(-101%);
    transition: transform ${DURATION.md} ${EASING.standard};
    z-index: -1;
  }

  &:is(:hover, :focus-within)::before {
    transform: translateX(0);
  }

  @keyframes partners-stage-craft-cell-in {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;

    &::before {
      transition: none;
    }
  }
`;

// Decoration, where there is room for it. The map fades out at the bottom
// (a mask, not a painted gradient).
const Band = styled.div`
  border-bottom: 1px solid ${semanticColor.line};
  display: none;
  flex-shrink: 0;
  height: 180px;
  position: relative;

  & > [aria-hidden]:first-child {
    mask-image: linear-gradient(to bottom, black 45%, transparent 100%);
  }

  ${mediaUp('md')} {
    display: block;
  }
`;

const Content = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${spacing(4)};
  min-width: 0;
  padding: ${spacing(6)};
`;

const Logo = styled.div`
  align-self: flex-start;
  transition: transform ${DURATION.md} ${EASING.spring};

  ${Card}:is(:hover, :focus-within) & {
    transform: scale(1.06);
  }

  ${Card}:active & {
    transform: scale(0.97);
  }

  ${REDUCED_MOTION} {
    transition: none;
  }
`;

const Text = styled.div`
  & > * + * {
    margin-top: ${spacing(1.5)};
  }
`;

const Regions = styled.p`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.08em;
  line-height: 15px;
  text-transform: uppercase;
`;

const Name = styled.h3`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4.5)};
  font-weight: ${FONT_WEIGHT.medium};
  line-height: 24px;
`;

// The whole card is the profile link's hit area.
const NameLink = styled(LocalizedLink)`
  color: inherit;
  text-decoration: none;

  &::after {
    content: '';
    inset: 0;
    position: absolute;
  }

  &:focus-visible::after {
    border-radius: ${radius(2)};
    outline: 1px solid ${color('blue')};
    outline-offset: -2px;
  }
`;

const Pitch = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: ${semanticColor.inkMuted};
  display: -webkit-box;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  line-height: 22px;
  overflow: hidden;
  overflow-wrap: anywhere;
`;

// The two facts to compare, on a rule, pinned to the bottom so the rules
// line up across a row: the price left, the languages right.
const Facts = styled.div`
  align-items: baseline;
  border-top: 1px solid ${semanticColor.line};
  display: flex;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  gap: ${spacing(4)};
  justify-content: space-between;
  line-height: 20px;
  margin-top: auto;
  padding-top: ${spacing(4)};
`;

const Price = styled.span`
  color: ${semanticColor.ink};
  flex-shrink: 0;
  font-weight: ${FONT_WEIGHT.medium};
`;

const Languages = styled.span`
  color: ${semanticColor.inkMuted};
  min-width: 0;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type PartnersStageCraftCellProps = {
  index: number;
  partner: MarketplacePartner;
  region: ServedGeo | null;
};

export function PartnersStageCraftCell({
  index,
  partner,
  region,
}: PartnersStageCraftCellProps) {
  const { i18n } = useLingui();
  const headingId = `partners-stage-craft-cell-${partner.slug}`;
  const base = resolvePartnerCoordinates(
    partner.city ?? '',
    partner.country ?? '',
    partner.region,
  );
  const coverRegion = region ?? partner.region[0] ?? 'EUROPE';
  const { regionLine, languageNames, languageValue, price } =
    describePartnersStagePartner(partner, i18n);

  return (
    <Card
      aria-labelledby={headingId}
      data-partners-stage-cell=""
      id={`partner-${partner.slug}`}
      style={{
        ['--partners-stage-cell-index' as string]: Math.min(index, 12),
      }}
    >
      <Band>
        <PartnersStageRegionCover
          accent={PARTNERS_STAGE_REGION_ACCENT[coverRegion]}
          center={base ?? PARTNERS_STAGE_REGION_CENTER[coverRegion]}
          hasBase={base !== null}
        />
      </Band>
      <Content>
        <Logo>
          <PartnersStageMark
            markUrl={partner.profilePictureUrl}
            name={partner.name}
            sizePx={40}
            tone="dark"
          />
        </Logo>
        <Text>
          {regionLine.length > 0 && <Regions>{regionLine}</Regions>}
          <Name id={headingId}>
            <NameLink href={`/partners/profile/${partner.slug}`}>
              {partner.name}
            </NameLink>
          </Name>
          <Pitch>{richTextExcerpt(partner.description)}</Pitch>
        </Text>
        <Facts>
          <Price>{price ?? '–'}</Price>
          <Languages title={languageNames.join(', ')}>
            {languageValue}
          </Languages>
        </Facts>
      </Content>
    </Card>
  );
}
