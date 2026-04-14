'use client';

import { useEffect, useState, type ReactNode } from 'react';

type VisibleWhenTabActiveProps = {
  children: ReactNode;
};

function getIsTabActive() {
  if (typeof document === 'undefined') {
    return true;
  }

  return document.visibilityState !== 'hidden';
}

export function VisibleWhenTabActive({
  children,
}: VisibleWhenTabActiveProps) {
  const [isTabActive, setIsTabActive] = useState(true);

  useEffect(() => {
    const syncTabVisibility = () => {
      setIsTabActive(getIsTabActive());
    };

    syncTabVisibility();
    document.addEventListener('visibilitychange', syncTabVisibility);

    return () => {
      document.removeEventListener('visibilitychange', syncTabVisibility);
    };
  }, []);

  if (!isTabActive) {
    return null;
  }

  return <>{children}</>;
}
