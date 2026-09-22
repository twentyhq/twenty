import { ApplicationHealthStatus } from '@/application/applicationHealthStatus';
import { isApplicationHealthCheckResult } from '@/application/applicationHealthType';

describe('isApplicationHealthCheckResult', () => {
  it.each([
    [{ status: 'OK' }],
    [{ status: ApplicationHealthStatus.OK }],
    [{ status: 'SUCCESS', message: 'Connected as acme' }],
    [
      {
        status: ApplicationHealthStatus.WARNING,
        message: 'Quota almost reached',
      },
    ],
    [{ status: 'INFO', message: 'Key expires soon' }],
    [{ status: 'WARNING', message: 'Quota almost reached' }],
    [{ status: 'NEUTRAL', message: 'Nothing synced yet' }],
    [
      {
        status: 'ERROR',
        message: 'Key revoked',
        action: { label: 'Fix', location: '/settings/billing' },
      },
    ],
    [{ status: 'ERROR', message: 'Key revoked', action: { label: 'Fix' } }],
  ])('should accept %p', (value) => {
    expect(isApplicationHealthCheckResult(value)).toBe(true);
  });

  it.each([
    [null],
    ['ok'],
    [{}],
    [{ status: 'UNKNOWN' }],
    [{ status: 'error', message: 'Boom' }],
    [{ status: 'ERROR' }],
    [{ status: 'ERROR', message: '' }],
    [{ status: 'ERROR', message: 'Boom', action: {} }],
    [{ status: 'ERROR', message: 'Boom', action: { label: 2 } }],
    [{ status: 'ERROR', message: 'Boom', action: { label: '' } }],
    [
      {
        status: 'ERROR',
        message: 'Boom',
        action: { label: 'Fix', location: 2 },
      },
    ],
    [
      {
        status: 'ERROR',
        message: 'Boom',
        action: { label: 'Fix', location: '' },
      },
    ],
  ])('should reject %p', (value) => {
    expect(isApplicationHealthCheckResult(value)).toBe(false);
  });
});
