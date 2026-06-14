'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import {
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  REDUCED_MOTION,
  semanticColor,
  spacing,
} from '@/tokens';

import { type MarketplacePartner } from './marketplace-partner';
import { ProfileEyebrow } from './profile-eyebrow';
import { SERVED_GEO_LABELS } from './served-geo-labels';

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
  const { i18n } = useLingui();

  // Served regions are the partner's market coverage, not their address.
  const eyebrow = partner.region
    .map((geo) => i18n._(SERVED_GEO_LABELS[geo]))
    .filter(Boolean)
    .join(' · ');

  return (
    <Wrapper>
      {eyebrow && <ProfileEyebrow>{eyebrow}</ProfileEyebrow>}
      <Name id="partner-name">{partner.name}</Name>
    </Wrapper>
  );
}
