import { ApplicationHealthStatus } from '@/application/applicationHealthStatus';
import { isApplicationHealthCheckResult } from '@/application/applicationHealthType';

describe('isApplicationHealthCheckResult', () => {
  it.each([
    [{ status: 'OK' }],
    [{ status: ApplicationHealthStatus.OK }],
    [{ status: 'SUCCESS', title: 'Connected as acme' }],
    [
      {
        status: ApplicationHealthStatus.WARNING,
        title: 'Quota almost reached',
      },
    ],
    [{ status: 'INFO', title: 'Key expires soon' }],
    [{ status: 'WARNING', title: 'Quota almost reached' }],
    [{ status: 'NEUTRAL', title: 'Nothing synced yet' }],
    [
      {
        status: 'ERROR',
        title: 'Key revoked',
        action: { label: 'Fix', location: '/settings/billing' },
      },
    ],
    [{ status: 'ERROR', title: 'Key revoked', action: { label: 'Fix' } }],
    [
      {
        status: 'ERROR',
        title: 'Key revoked',
        description: 'Generate a new one from the provider dashboard.',
      },
    ],
  ])('should accept %p', (value) => {
    expect(isApplicationHealthCheckResult(value)).toBe(true);
  });

  it.each([
    [null],
    ['ok'],
    [{}],
    [{ status: 'UNKNOWN' }],
    [{ status: 'error', title: 'Boom' }],
    [{ status: 'ERROR' }],
    [{ status: 'ERROR', title: '' }],
    [{ status: 'ERROR', title: 'Boom', description: '' }],
    [{ status: 'ERROR', title: 'Boom', description: 2 }],
    [{ status: 'ERROR', title: 'Boom', action: {} }],
    [{ status: 'ERROR', title: 'Boom', action: { label: 2 } }],
    [{ status: 'ERROR', title: 'Boom', action: { label: '' } }],
    [
      {
        status: 'ERROR',
        title: 'Boom',
        action: { label: 'Fix', location: 2 },
      },
    ],
    [
      {
        status: 'ERROR',
        title: 'Boom',
        action: { label: 'Fix', location: '' },
      },
    ],
  ])('should reject %p', (value) => {
    expect(isApplicationHealthCheckResult(value)).toBe(false);
  });
});
