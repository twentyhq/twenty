import { isBillableOperationFreeAllowance } from '@/application/billableOperationsType';

describe('isBillableOperationFreeAllowance', () => {
  it.each([
    { quantity: 3000 },
    { durationInDays: 60 },
    {
      quantity: 3000,
      durationInDays: 60,
      workspaceCreatedFrom: '2026-10-22T00:00:00.000Z',
    },
  ])('should accept %j', (freeAllowance) => {
    expect(isBillableOperationFreeAllowance(freeAllowance)).toBe(true);
  });

  it.each([
    null,
    'free',
    {},
    { workspaceCreatedFrom: '2026-10-22T00:00:00.000Z' },
    { quantity: 0 },
    { quantity: -10 },
    { quantity: 1.5 },
    { quantity: '3000' },
    { durationInDays: 0 },
    { quantity: 3000, workspaceCreatedFrom: 'not a date' },
    { quantity: 3000, workspaceCreatedFrom: 1_790_000_000_000 },
  ])('should reject %j', (freeAllowance) => {
    expect(isBillableOperationFreeAllowance(freeAllowance)).toBe(false);
  });
});
