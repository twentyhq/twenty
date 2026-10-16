'use client';

import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { readPartnerFromUrl } from './read-partner-from-url';
import { savePartner } from './save-partner';

export function PartnerAttributionEffect(): null {
  useEffect(() => {
    const partner = readPartnerFromUrl();

    if (isDefined(partner)) {
      savePartner(partner);
    }
  }, []);

  return null;
}
