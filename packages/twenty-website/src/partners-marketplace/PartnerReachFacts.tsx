'use client';

import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import { fontFamily, fontSize, radius, semanticColor, spacing } from '@/tokens';

import { type MarketplacePartner } from './marketplace-partner';
import { SERVED_GEO_LABELS } from './served-geo-labels';
import { SPOKEN_LANGUAGE_LABELS } from './spoken-language-labels';
import { titleCaseFallback } from './title-case-fallback';

const ReachSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(3.5)};
  width: 100%;
`;

const FactGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
`;

const FactLabel = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(2.75)};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const ChipRow = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(1.5)};
  list-style: none;
  padding: 0;
`;

const Chip = styled.li`
  background-color: ${semanticColor.surface};
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(1.5)};
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  padding: ${spacing(1.5)} ${spacing(2.5)};
`;

function resolveLabels<TValue extends string>(
  values: readonly TValue[],
  labels: Record<TValue, MessageDescriptor>,
  translate: (descriptor: MessageDescriptor) => string,
): string[] {
  return values.map((value) => {
    const descriptor = labels[value];
    return descriptor ? translate(descriptor) : titleCaseFallback(value);
  });
}

export function PartnerReachFacts({
  languagesSpoken,
  region,
}: {
  languagesSpoken: MarketplacePartner['languagesSpoken'];
  region: MarketplacePartner['region'];
}) {
  const { i18n } = useLingui();
  const translate = (descriptor: MessageDescriptor) => i18n._(descriptor);

  const regionLabels = resolveLabels(region, SERVED_GEO_LABELS, translate);
  const languageLabels = resolveLabels(
    languagesSpoken,
    SPOKEN_LANGUAGE_LABELS,
    translate,
  );

  if (regionLabels.length === 0 && languageLabels.length === 0) {
    return null;
  }

  return (
    <ReachSection>
      {regionLabels.length > 0 && (
        <FactGroup>
          <FactLabel>{i18n._(msg`Regions served`)}</FactLabel>
          <ChipRow aria-label={i18n._(msg`Regions`)}>
            {regionLabels.map((label) => (
              <Chip key={label}>{label}</Chip>
            ))}
          </ChipRow>
        </FactGroup>
      )}
      {languageLabels.length > 0 && (
        <FactGroup>
          <FactLabel>{i18n._(msg`Languages`)}</FactLabel>
          <ChipRow aria-label={i18n._(msg`Languages spoken`)}>
            {languageLabels.map((label) => (
              <Chip key={label}>{label}</Chip>
            ))}
          </ChipRow>
        </FactGroup>
      )}
    </ReachSection>
  );
}
