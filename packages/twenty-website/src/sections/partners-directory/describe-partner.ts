import { type I18n } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { formatUsdRate } from '@/partners-marketplace/format-usd-rate';
import { type MarketplacePartner } from '@/partners-marketplace/marketplace-partner';
import { SERVED_GEO_LABELS } from '@/partners-marketplace/served-geo-labels';
import { SPOKEN_LANGUAGE_LABELS } from '@/partners-marketplace/spoken-language-labels';
import { titleCaseFallback } from '@/partners-marketplace/title-case-fallback';

// What a card and a row both print about a partner.
export const describePartner = (partner: MarketplacePartner, i18n: I18n) => {
  const languageNames = partner.languagesSpoken.map((language) =>
    language in SPOKEN_LANGUAGE_LABELS
      ? i18n._(SPOKEN_LANGUAGE_LABELS[language])
      : titleCaseFallback(language),
  );
  const hourly = formatUsdRate(partner.hourlyRateUsd);
  const minimum = formatUsdRate(partner.projectBudgetMinUsd);

  return {
    place: [
      partner.city,
      partner.country ? titleCaseFallback(partner.country) : '',
    ]
      .filter(Boolean)
      .join(', '),
    regionLine: partner.region
      .map((served) => i18n._(SERVED_GEO_LABELS[served]))
      .join(' · '),
    languageNames,
    languageValue:
      languageNames.length > 3
        ? `${languageNames.slice(0, 3).join(', ')} +${languageNames.length - 3}`
        : languageNames.join(', '),
    price: isDefined(hourly)
      ? i18n._(msg`${hourly}/hr`)
      : isDefined(minimum) && minimum !== '$0'
        ? i18n._(msg`From ${minimum}`)
        : null,
  };
};
