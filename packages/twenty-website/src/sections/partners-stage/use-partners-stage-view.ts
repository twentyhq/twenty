'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export type PartnersStageView = 'cards' | 'list';

// In the URL so a shared link keeps the view.
export const usePartnersStageView = () => {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view: PartnersStageView =
    params.get('view') === 'list' ? 'list' : 'cards';

  const setView = useCallback(
    (next: PartnersStageView) => {
      const nextParams = new URLSearchParams(params.toString());
      if (next === 'list') {
        nextParams.set('view', 'list');
      } else {
        nextParams.delete('view');
      }
      const nextQuery = nextParams.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    },
    [params, pathname, router],
  );

  return { view, setView };
};
