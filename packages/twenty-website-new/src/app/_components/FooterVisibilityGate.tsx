'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

type FooterVisibilityGateProps = {
  children: ReactNode;
};

export function FooterVisibilityGate({
  children,
}: FooterVisibilityGateProps) {
  const pathname = usePathname();

  if (pathname === '/halftone') {
    return null;
  }

  return <>{children}</>;
}
