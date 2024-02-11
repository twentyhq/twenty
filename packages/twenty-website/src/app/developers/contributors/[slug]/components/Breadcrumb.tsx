'use client';

import { Breadcrumbs } from '@/app/components/Breadcrumbs';

const BREADCRUMB_ITEMS = [
  {
    uri: '/developers/contributors',
    label: 'Contributors',
  },
];

export const Breadcrumb = ({ active }: { active: string }) => {
  return (
    <Breadcrumbs items={BREADCRUMB_ITEMS} activePage={active} separator="/" />
  );
};
