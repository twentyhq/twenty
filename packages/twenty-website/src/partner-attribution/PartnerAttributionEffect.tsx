'use client';

import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { SITE_URLS } from '@/platform/site-urls';

import { partnerSchema } from './partner-schema';
import { readSavedPartner } from './read-saved-partner';
import { savePartner } from './save-partner';

const PARTNER_QUERY_PARAM = 'via';
const APP_HOSTNAME = new URL(SITE_URLS.appWelcome).hostname;

const findAppLinks = (node: Node): HTMLAnchorElement[] => {
  if (!(node instanceof Element)) {
    return [];
  }

  return [node, ...node.querySelectorAll('a[href]')].filter(
    (element): element is HTMLAnchorElement =>
      element instanceof HTMLAnchorElement && element.hostname === APP_HOSTNAME,
  );
};

export function PartnerAttributionEffect(): null {
  useEffect(() => {
    const partnerFromUrl = partnerSchema.safeParse(
      new URLSearchParams(window.location.search).get(PARTNER_QUERY_PARAM),
    ).data;

    if (isDefined(partnerFromUrl)) {
      savePartner(partnerFromUrl);
    }

    const partner = readSavedPartner();

    if (!isDefined(partner)) {
      return;
    }

    const setPartnerOnAppLinks = (node: Node) => {
      for (const link of findAppLinks(node)) {
        const url = new URL(link.href);

        url.searchParams.set('partner', partner);

        if (url.href !== link.href) {
          link.href = url.href;
        }
      }
    };

    setPartnerOnAppLinks(document.body);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes') {
          setPartnerOnAppLinks(mutation.target);
        }

        mutation.addedNodes.forEach(setPartnerOnAppLinks);
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributeFilter: ['href'],
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
