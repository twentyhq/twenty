import { styled } from '@linaria/react';

import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';

import { MARKETPLACE_COPY } from './marketplace-copy';
import { type MarketplacePartner } from './marketplace-partner';
import { ProfileEyebrow } from './ProfileEyebrow';
import { SuperPartnerMark } from './SuperPartnerMark';
import { titleCaseFallback } from './title-case-fallback';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;

const Name = styled.h1`
  animation: profileNameEnter 700ms ${EASING.standard} both;
  color: ${semanticColor.ink};
  font-family: ${fontFamily('serif')};
  font-size: ${fontSize(12)};
  font-weight: ${FONT_WEIGHT.light};
  letter-spacing: -0.02em;
  line-height: ${fontSize(11)};

  @keyframes profileNameEnter {
    from {
      opacity: 0;
      transform: translate3d(0, 12px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  ${REDUCED_MOTION} {
    animation: none;
  }
`;

export function PartnerProfileHeader({
  partner,
}: {
  partner: MarketplacePartner;
}) {
  const i18n = getServerI18n();
  const locationLine = [
    partner.city,
    partner.country ? titleCaseFallback(partner.country) : '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Wrapper>
      {partner.superPartner ? (
        <SuperPartnerMark label={i18n._(MARKETPLACE_COPY.superPartner)} />
      ) : locationLine ? (
        <ProfileEyebrow>{locationLine}</ProfileEyebrow>
      ) : null}
      <Name id="partner-name">{partner.name}</Name>
      {partner.superPartner && locationLine ? (
        <ProfileEyebrow>{locationLine}</ProfileEyebrow>
      ) : null}
    </Wrapper>
  );
}
