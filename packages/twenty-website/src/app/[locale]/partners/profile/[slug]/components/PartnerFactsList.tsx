'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';

import type { MessageDescriptor } from '@lingui/core';
import {
  DEPLOYMENT_EXPERTISE_LABELS,
  SERVED_GEO_LABELS,
  SPOKEN_LANGUAGE_LABELS,
} from '@/app/[locale]/partners/list/components/chip-labels';
import type {
  DeploymentExpertise,
  MarketplacePartner,
  ServedGeo,
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
  region: MarketplacePartner['region'];
  languagesSpoken: MarketplacePartner['languagesSpoken'];
  deploymentExpertise: MarketplacePartner['deploymentExpertise'];
};

export function PartnerFactsList({
  region,
  languagesSpoken,
  deploymentExpertise,
}: PartnerFactsListProps) {
  const { i18n } = useLingui();
  const translate = (d: MessageDescriptor) => i18n._(d);

  const regionText = resolveLabels(
    region as readonly ServedGeo[],
    SERVED_GEO_LABELS,
    translate,
  );
  const languageText = resolveLabels(
    languagesSpoken as readonly SpokenLanguage[],
    SPOKEN_LANGUAGE_LABELS,
    translate,
  );
  const deployText = resolveLabels(
    deploymentExpertise as readonly DeploymentExpertise[],
    DEPLOYMENT_EXPERTISE_LABELS,
    translate,
  );

  return (
    <FactsDl>
      {regionText && (
        <FactRow>
          <FactLabel>{i18n._(msg`Regions`)}</FactLabel>
          <FactValue>{regionText}</FactValue>
        </FactRow>
      )}
      {languageText && (
        <FactRow>
          <FactLabel>{i18n._(msg`Languages`)}</FactLabel>
          <FactValue>{languageText}</FactValue>
        </FactRow>
      )}
      {deployText && (
        <FactRow>
          <FactLabel>{i18n._(msg`Deploys`)}</FactLabel>
          <FactValue>{deployText}</FactValue>
        </FactRow>
      )}
    </FactsDl>
  );
}
