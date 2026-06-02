'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import type { MessageDescriptor } from '@lingui/core';
import {
  PARTNER_SCOPE_LABELS,
  SPOKEN_LANGUAGE_LABELS,
} from '@/app/[locale]/partners/list/components/chip-labels';
import type {
  MarketplacePartner,
  PartnerScope,
  SpokenLanguage,
} from '@/lib/partners-api';
import { theme } from '@/theme';

const FactsDl = styled.dl`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
  margin: 0;
`;

const FactRow = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${theme.spacing(3)};
`;

const FactLabel = styled.dt`
  color: ${theme.colors.primary.text[60]};
  flex-shrink: 0;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
  width: 100px;
`;

const FactValue = styled.dd`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  margin: 0;
`;

// Falls back when the CMS stores a value the website doesn't yet know about.
const titleCaseFallback = (raw: string): string =>
  raw
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

function resolveLabels<TValue extends string>(
  values: readonly TValue[],
  labelMap: Record<TValue, MessageDescriptor>,
  translate: (descriptor: MessageDescriptor) => string,
): string {
  return values
    .map((v) => {
      const descriptor = labelMap[v];
      return descriptor ? translate(descriptor) : titleCaseFallback(v);
    })
    .join(', ');
}

type PartnerFactsListProps = {
  city: MarketplacePartner['city'];
  country: MarketplacePartner['country'];
  languagesSpoken: MarketplacePartner['languagesSpoken'];
  partnerScope: MarketplacePartner['partnerScope'];
};

export function PartnerFactsList({
  city,
  country,
  languagesSpoken,
  partnerScope,
}: PartnerFactsListProps) {
  const { i18n } = useLingui();
  const translate = (d: MessageDescriptor) => i18n._(d);

  // Country is a CRM SELECT enum (e.g. "UNITED_STATES"); title-case it.
  const locationText = [city, country ? titleCaseFallback(country) : '']
    .filter(Boolean)
    .join(', ');
  const languageText = resolveLabels(
    languagesSpoken as readonly SpokenLanguage[],
    SPOKEN_LANGUAGE_LABELS,
    translate,
  );
  const categoryText = resolveLabels(
    partnerScope as readonly PartnerScope[],
    PARTNER_SCOPE_LABELS,
    translate,
  );

  return (
    <FactsDl>
      {locationText && (
        <FactRow>
          <FactLabel>{i18n._(msg`Based in`)}</FactLabel>
          <FactValue>{locationText}</FactValue>
        </FactRow>
      )}
      {languageText && (
        <FactRow>
          <FactLabel>{i18n._(msg`Languages`)}</FactLabel>
          <FactValue>{languageText}</FactValue>
        </FactRow>
      )}
      {categoryText && (
        <FactRow>
          <FactLabel>{i18n._(msg`Categories`)}</FactLabel>
          <FactValue>{categoryText}</FactValue>
        </FactRow>
      )}
    </FactsDl>
  );
}
