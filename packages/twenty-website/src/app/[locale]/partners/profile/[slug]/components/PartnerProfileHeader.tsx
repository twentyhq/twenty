'use client';

import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import type { MarketplacePartner } from '@/lib/partners-api';
import { SERVED_GEO_LABELS } from '@/app/[locale]/partners/list/components/chip-labels';
import { theme } from '@/theme';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
`;

const Eyebrow = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
`;

const Name = styled.h1`
  animation: nameEnter 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(12)};
  font-weight: ${theme.font.weight.light};
  letter-spacing: -0.02em;
  line-height: ${theme.lineHeight(11)};
  margin: 0;

  @keyframes nameEnter {
    from {
      opacity: 0;
      transform: translate3d(0, 12px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

type PartnerProfileHeaderProps = {
  partner: MarketplacePartner;
};

export function PartnerProfileHeader({ partner }: PartnerProfileHeaderProps) {
  const { i18n } = useLingui();

  // Served regions are the partner's market coverage, not their address.
  const eyebrow = partner.region
    .map((geo) => i18n._(SERVED_GEO_LABELS[geo]))
    .filter(Boolean)
    .join(' · ');

  return (
    <Wrapper>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Name id="partner-name">{partner.name}</Name>
    </Wrapper>
  );
}
