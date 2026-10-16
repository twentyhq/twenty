'use client';

import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { partnerSchema } from './partner-schema';
import { readSavedPartner } from './read-saved-partner';
import { savePartner } from './save-partner';
import { setPartnerOnAppUrl } from './set-partner-on-app-url';

// Not ?partner= like the app: /partners/brief already uses it to address a
// brief to a directory partner.
const PARTNER_QUERY_PARAM = 'via';
const LINK_OPENING_EVENT_NAMES = ['click', 'auxclick', 'contextmenu'] as const;

export function PartnerAttributionEffect(): null {
  useEffect(() => {
    const partnerFromUrl = partnerSchema.safeParse(
      new URLSearchParams(window.location.search).get(PARTNER_QUERY_PARAM),
    ).data;

    if (isDefined(partnerFromUrl)) {
      savePartner(partnerFromUrl);
    }

    const setSavedPartnerOnOpenedLink = (event: MouseEvent) => {
      const link =
        event.target instanceof Element
          ? event.target.closest('a[href]')
          : null;

      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      const href = setPartnerOnAppUrl({
        href: link.href,
        partner: readSavedPartner(),
      });

      if (href !== link.href) {
        link.href = href;
      }
    };

    for (const eventName of LINK_OPENING_EVENT_NAMES) {
      document.addEventListener(eventName, setSavedPartnerOnOpenedLink, true);
    }

    return () => {
      for (const eventName of LINK_OPENING_EVENT_NAMES) {
        document.removeEventListener(
          eventName,
          setSavedPartnerOnOpenedLink,
          true,
        );
      }
    };
  }, []);

  return null;
}
