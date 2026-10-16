'use client';

import { useEffect } from 'react';
import { isDefined, normalizePartner } from 'twenty-shared/utils';

import { addPartnerToAppUrl } from './add-partner-to-app-url';
import { readSavedPartner, savePartner } from './partner-storage';

const LINK_ACTIVATION_EVENT_NAMES = ['click', 'auxclick'] as const;

export function PartnerAttributionEffect(): null {
  useEffect(() => {
    const partnerFromUrl = normalizePartner(
      new URLSearchParams(window.location.search).get('partner'),
    );

    if (isDefined(partnerFromUrl)) {
      savePartner(partnerFromUrl);
    }

    const addPartnerToActivatedLink = (event: MouseEvent) => {
      const link =
        event.target instanceof Element
          ? event.target.closest('a[href]')
          : null;
      const partner = readSavedPartner();

      if (!(link instanceof HTMLAnchorElement) || !isDefined(partner)) {
        return;
      }

      const hrefWithPartner = addPartnerToAppUrl(link.href, partner);

      if (hrefWithPartner !== link.href) {
        link.href = hrefWithPartner;
      }
    };

    for (const eventName of LINK_ACTIVATION_EVENT_NAMES) {
      document.addEventListener(eventName, addPartnerToActivatedLink, true);
    }

    return () => {
      for (const eventName of LINK_ACTIVATION_EVENT_NAMES) {
        document.removeEventListener(
          eventName,
          addPartnerToActivatedLink,
          true,
        );
      }
    };
  }, []);

  return null;
}
