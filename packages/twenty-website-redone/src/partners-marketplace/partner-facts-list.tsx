'use client';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { color, fontFamily, fontSize, semanticColor, spacing } from '@/tokens';

import { type MarketplacePartner } from './marketplace-partner';
import { PARTNER_SCOPE_LABELS } from './partner-scope-labels';
import { SPOKEN_LANGUAGE_LABELS } from './spoken-language-labels';
import { titleCaseFallback } from './title-case-fallback';

const FactsDl = styled.dl`
  display: flex;
  flex-direction: column;

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const FactRow = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${spacing(3)};
`;

const FactLabel = styled.dt`
  color: ${semanticColor.inkMuted};
  flex-shrink: 0;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  letter-spacing: 0.08em;
  margin: 0;
  text-transform: uppercase;
  width: 100px;
`;

const FactValue = styled.dd`
  color: ${color('black-80')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  margin: 0;
`;

function resolveLabels<TValue extends string>(
  values: readonly TValue[],
  labels: Record<TValue, MessageDescriptor>,
  translate: (descriptor: MessageDescriptor) => string,
): string {
  return values
    .map((value) => {
      const descriptor = labels[value];
      return descriptor ? translate(descriptor) : titleCaseFallback(value);
    })
    .join(', ');
}

export function PartnerFactsList({
  city,
  country,
  languagesSpoken,
  partnerScope,
}: {
  city: MarketplacePartner['city'];
  country: MarketplacePartner['country'];
  languagesSpoken: MarketplacePartner['languagesSpoken'];
  partnerScope: MarketplacePartner['partnerScope'];
}) {
  const { i18n } = useLingui();
  const translate = (descriptor: MessageDescriptor) => i18n._(descriptor);

  // Country is a CRM SELECT enum (e.g. "UNITED_STATES"); title-case it.
  const locationText = [city, country ? titleCaseFallback(country) : '']
    .filter(Boolean)
    .join(', ');
  const languageText = resolveLabels(
    languagesSpoken,
    SPOKEN_LANGUAGE_LABELS,
    translate,
  );
  const categoryText = resolveLabels(
    partnerScope,
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
