import { msg } from '@lingui/core/macro';

import {
  type PlanTableBodyRowDataType,
  type PlanTableCellType,
} from './plan-table-types';
import { resolveVisibleRows } from './plan-table-visible-rows';

const yes: PlanTableCellType = { kind: 'yes' };
const dash: PlanTableCellType = { kind: 'dash' };

const FIXTURE: PlanTableBodyRowDataType[] = [
  {
    featureLabel: msg`always`,
    tiers: { organization: yes, pro: yes },
    type: 'row',
  },
  {
    appliesTo: 'cloud',
    featureLabel: msg`cloud`,
    tiers: { organization: yes, pro: yes },
    type: 'row',
  },
  {
    appliesTo: 'selfHost',
    featureLabel: msg`self`,
    tiers: { organization: yes, pro: yes },
    type: 'row',
  },
  {
    featureLabel: msg`swap`,
    selfHostTiers: { organization: dash, pro: dash },
    tiers: { organization: yes, pro: yes },
    type: 'row',
  },
];

const hasDashPro = (rows: PlanTableBodyRowDataType[]): boolean =>
  rows.some((row) => row.type === 'row' && row.tiers.pro.kind === 'dash');

describe('resolveVisibleRows', () => {
  it('drops self-host-only rows in cloud mode', () => {
    const rows = resolveVisibleRows(FIXTURE, 'cloud');

    expect(rows).toHaveLength(3);
    expect(rows.every((row) => row.appliesTo !== 'selfHost')).toBe(true);
  });

  it('drops cloud-only rows in self-host mode', () => {
    const rows = resolveVisibleRows(FIXTURE, 'selfHost');

    expect(rows).toHaveLength(3);
    expect(rows.every((row) => row.appliesTo !== 'cloud')).toBe(true);
  });

  it('swaps in self-host tier values only in self-host mode', () => {
    expect(hasDashPro(resolveVisibleRows(FIXTURE, 'cloud'))).toBe(false);
    expect(hasDashPro(resolveVisibleRows(FIXTURE, 'selfHost'))).toBe(true);
  });

  it('drops a category left with no rows beneath it', () => {
    const rows = resolveVisibleRows(
      [
        { title: msg`empty`, type: 'category' },
        { title: msg`kept`, type: 'category' },
        {
          featureLabel: msg`feature`,
          tiers: { organization: yes, pro: yes },
          type: 'row',
        },
      ],
      'cloud',
    );

    expect(rows).toHaveLength(2);
    expect(rows[0].type).toBe('category');
    expect(rows[1].type).toBe('row');
  });
});
