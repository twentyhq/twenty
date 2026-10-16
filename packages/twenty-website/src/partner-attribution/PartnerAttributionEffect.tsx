'use client';

import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { PARTNER_STORAGE_KEY } from './partner-storage-key';

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
      sessionStorage.setItem(PARTNER_STORAGE_KEY, partner);
    } catch {
      return;
    }
  }, []);

  return null;
}
