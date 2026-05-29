import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { PartnerAvatar } from '@/app/[locale]/partners/list/components/PartnerAvatar';
import type { MarketplacePartner } from '@/lib/partners-api';
import { SERVED_GEO_LABELS } from '@/app/[locale]/partners/list/components/chip-labels';
import { theme } from '@/theme';

const Wrapper = styled.header`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  text-align: center;
`;

const Avatar = styled.div`
  border-radius: 50%;
  height: 120px;
  overflow: hidden;
  width: 120px;
`;

const RealPhoto = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const Name = styled.h1`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(9)};
  font-weight: ${theme.font.weight.light};
  letter-spacing: -0.02em;
  margin: 0;
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

const isSafeHttpUrl = (raw: string) => {
  try {
    return ['https:', 'http:'].includes(new URL(raw).protocol);
  } catch {
    return false;
  }
};

type PartnerProfileHeaderProps = {
  partner: MarketplacePartner;
};

export function PartnerProfileHeader({ partner }: PartnerProfileHeaderProps) {
  const { i18n } = useLingui();
  const firstGeo = partner.region[0];
  const region = firstGeo ? i18n._(SERVED_GEO_LABELS[firstGeo]) : '';

  const locationParts = [partner.city, partner.country].filter(Boolean);
  const eyebrow = [region, ...locationParts].filter(Boolean).join(' · ');

  const showRealPhoto = isSafeHttpUrl(partner.profilePictureUrl);

  return (
    <Wrapper>
      <Avatar>
        {showRealPhoto ? (
          <RealPhoto
            src={partner.profilePictureUrl}
            alt={i18n._(msg`${partner.name} profile picture`)}
          />
        ) : (
          <PartnerAvatar name={partner.name} slug={partner.slug} />
        )}
      </Avatar>
      <Name>{partner.name}</Name>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
    </Wrapper>
  );
}
