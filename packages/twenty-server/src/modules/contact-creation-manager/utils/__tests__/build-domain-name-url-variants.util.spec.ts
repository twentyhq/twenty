import { buildDomainNameUrlVariants } from 'src/modules/contact-creation-manager/utils/build-domain-name-url-variants.util';

describe('buildDomainNameUrlVariants', () => {
  it('should build every spelling a company domain is stored under', () => {
    expect(buildDomainNameUrlVariants('twenty.com')).toEqual([
      'twenty.com',
      'twenty.com/',
      'www.twenty.com',
      'www.twenty.com/',
      'https://twenty.com',
      'https://twenty.com/',
      'https://www.twenty.com',
      'https://www.twenty.com/',
      'http://twenty.com',
      'http://twenty.com/',
      'http://www.twenty.com',
      'http://www.twenty.com/',
    ]);
  });
});
