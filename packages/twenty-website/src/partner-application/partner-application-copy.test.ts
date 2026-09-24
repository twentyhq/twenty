import { PARTNER_APPLICATION_COPY } from './partner-application-copy';

describe('partner application proof hint', () => {
  const hint = PARTNER_APPLICATION_COPY.fields.twentyExperienceProofLinkHint.id;

  it('asks first for a live instance or a YouTube link', () => {
    expect(hint).toContain('live Twenty instance');
    expect(hint).toContain('YouTube');
    expect(hint.indexOf('live Twenty instance')).toBeLessThan(
      hint.indexOf('Loom'),
    );
  });

  it('still accepts the slower formats and says they are slower', () => {
    expect(hint).toContain('Loom');
    expect(hint).toContain('Drive');
    expect(hint).toContain('slower to review');
  });
});
