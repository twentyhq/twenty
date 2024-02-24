'use client';

import { Breadcrumbs } from '@/app/_components/ui/layout/Breadcrumbs';

const BREADCRUMB_ITEMS = [
  {
    uri: '/contributors',
    label: 'Contributors',
  },
];

export const Breadcrumb = ({ active }: { active: string }) => {
  return (
    <Breadcrumbs items={BREADCRUMB_ITEMS} activePage={active} separator="/" />
  );
};
