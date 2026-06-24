import { buildEmailFrom } from 'src/utils/build-email-from';

describe('buildEmailFrom', () => {
  it('uses EMAIL_FROM_NAME when EMAIL_FROM_ADDRESS is a plain address', () => {
    const result = buildEmailFrom('noreply@acme.com', 'Felix from Twenty');

    expect(result).toBe('"Felix from Twenty" <noreply@acme.com>');
  });

  it('uses display name from EMAIL_FROM_ADDRESS when present, ignoring EMAIL_FROM_NAME', () => {
    const result = buildEmailFrom(
      '"Acme CRM" <noreply@acme.com>',
      'Felix from Twenty',
    );

    expect(result).toBe('"Acme CRM" <noreply@acme.com>');
  });

  it('uses unquoted display name from EMAIL_FROM_ADDRESS when present', () => {
    const result = buildEmailFrom(
      'Acme CRM <noreply@acme.com>',
      'Fallback Name',
    );

    expect(result).toBe('"Acme CRM" <noreply@acme.com>');
  });

  it('returns plain address when no display name is available', () => {
    const result = buildEmailFrom('noreply@acme.com', '');

    expect(result).toBe('noreply@acme.com');
  });

  it('escapes double quotes in the display name', () => {
    const result = buildEmailFrom(
      'noreply@acme.com',
      'John "The Boss" Doe',
    );

    expect(result).toBe('"John \\"The Boss\\" Doe" <noreply@acme.com>');
  });

  it('escapes backslashes in the display name', () => {
    const result = buildEmailFrom('noreply@acme.com', 'ACME\\Support');

    expect(result).toBe('"ACME\\\\Support" <noreply@acme.com>');
  });
});
