import { type ReactNode } from 'react';

import { DesignSystemShell } from '@/platform/design-system/DesignSystemShell';

// Mounted once for every /design-system page, so navigation keeps the sidebar.
export default function DesignSystemLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DesignSystemShell>{children}</DesignSystemShell>;
}
