'use client';

import { useRouter } from 'next/navigation';
import { type MouseEvent, type ReactNode } from 'react';

import { PARTNERS_STAGE_RETURN } from './partners-stage-return';

const readSession = (key: string): string | null => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

// PROTOTYPE (?direction=e): wraps the partner page's "All partners" link.
// Coming from the directory, it goes back in history (same scroll, filters
// and view); otherwise it opens the directory as last seen. The mark is
// left in place: the directory spends it when it shows again.
export function PartnersStageReturnToDirectory({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const handleClickCapture = (event: MouseEvent<HTMLSpanElement>) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.button !== 0
    ) {
      return;
    }
    if (readSession(PARTNERS_STAGE_RETURN.leftKey) === '1') {
      event.preventDefault();
      router.back();
      return;
    }
    const lastUrl = readSession(PARTNERS_STAGE_RETURN.urlKey);
    if (lastUrl !== null) {
      event.preventDefault();
      router.push(lastUrl);
    }
  };

  return <span onClickCapture={handleClickCapture}>{children}</span>;
}
