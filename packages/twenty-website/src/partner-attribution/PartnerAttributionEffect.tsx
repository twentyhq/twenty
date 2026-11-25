'use client';

import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { savePartner } from './save-partner';

const PARTNER_QUERY_PARAM = 'via';

export function PartnerAttributionEffect(): null {
  useEffect(() => {
    const partner = new URLSearchParams(window.location.search).get(
      PARTNER_QUERY_PARAM,
    );

    if (!isDefined(partner) || partner === '') {
      return;
    }

    try {
      savePartner({ storage: localStorage, code: partner, now: Date.now() });
    } catch {
      return;
    }
  }, []);

  return null;
}
