import { type PlansHostingMode } from '@/pricing-state';

import { type PlanTableBodyRowDataType } from './plan-table-types';

export function resolveVisibleRows(
  rows: readonly PlanTableBodyRowDataType[],
  hosting: PlansHostingMode,
): PlanTableBodyRowDataType[] {
  const scoped = rows.flatMap((row): PlanTableBodyRowDataType[] => {
    if (row.appliesTo !== undefined && row.appliesTo !== hosting) {
      return [];
    }

    if (
      row.type === 'row' &&
      hosting === 'selfHost' &&
      row.selfHostTiers !== undefined
    ) {
      return [{ ...row, tiers: row.selfHostTiers }];
    }

    return [row];
  });

  return scoped.filter((row, index) => {
    if (row.type !== 'category') {
      return true;
    }

    const next = scoped
      .slice(index + 1)
      .find(
        (candidate) =>
          candidate.type === 'category' || candidate.type === 'row',
      );

    return next !== undefined && next.type !== 'category';
  });
}
