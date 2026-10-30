import { isUpstreamSpam } from 'src/modules/messaging/message-import-manager/utils/is-upstream-spam.util';

const microsoftReport = (verdict: string) =>
  `CIP:203.0.113.7;CTRY:;LANG:de;SCL:8;SRV:;IPV:NLI;SFV:${verdict};H:mail.example.com;PTR:mail.example.com;CAT:OSPM;DIR:OUT;SFP:1501;`;

describe('isUpstreamSpam', () => {
  it('should flag mail Microsoft 365 classified as spam before forwarding', () => {
    expect(
      isUpstreamSpam([
        { name: 'X-Forefront-Antispam-Report', value: microsoftReport('SPM') },
      ]),
    ).toBe(true);
  });

  it('should not flag mail Microsoft 365 classified as not spam', () => {
    expect(
      isUpstreamSpam([
        { name: 'X-Forefront-Antispam-Report', value: microsoftReport('NSPM') },
      ]),
    ).toBe(false);
  });

  it('should only trust the topmost verdict', () => {
    expect(
      isUpstreamSpam([
        { name: 'X-Forefront-Antispam-Report', value: microsoftReport('NSPM') },
        { name: 'X-Forefront-Antispam-Report', value: microsoftReport('SPM') },
      ]),
    ).toBe(false);
  });

  it('should flag mail SpamAssassin or Rspamd marked as spam', () => {
    expect(isUpstreamSpam([{ name: 'X-Spam-Flag', value: 'YES' }])).toBe(true);
    expect(isUpstreamSpam([{ name: 'X-Spam', value: 'Yes' }])).toBe(true);
    expect(isUpstreamSpam([{ name: 'X-Spam-Flag', value: 'NO' }])).toBe(false);
  });
});
