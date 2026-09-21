import { isApplicationHealthCheckResult } from '@/application/applicationHealthType';

describe('isApplicationHealthCheckResult', () => {
  it.each([
    [{ status: 'ok' }],
    [{ status: 'warning', message: 'Key expires soon' }],
    [
      {
        status: 'error',
        message: 'Key revoked',
        action: { label: 'Fix', location: 'variables' },
      },
    ],
    [{ status: 'error', message: 'Key revoked', action: { label: 'Fix' } }],
  ])('should accept %p', (value) => {
    expect(isApplicationHealthCheckResult(value)).toBe(true);
  });

  it.each([
    [null],
    ['ok'],
    [{}],
    [{ status: 'unknown' }],
    [{ status: 'error' }],
    [{ status: 'error', message: '' }],
    [{ status: 'error', message: 'Boom', action: {} }],
    [{ status: 'error', message: 'Boom', action: { label: 2 } }],
    [{ status: 'error', message: 'Boom', action: { label: '' } }],
    [
      {
        status: 'error',
        message: 'Boom',
        action: { label: 'Fix', location: 2 },
      },
    ],
    [
      {
        status: 'error',
        message: 'Boom',
        action: { label: 'Fix', location: '' },
      },
    ],
  ])('should reject %p', (value) => {
    expect(isApplicationHealthCheckResult(value)).toBe(false);
  });
});
