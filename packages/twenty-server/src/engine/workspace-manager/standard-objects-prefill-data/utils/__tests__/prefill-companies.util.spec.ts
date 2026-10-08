import { normalizeDomain } from 'twenty-shared/utils';

import { PREFILL_COMPANY_ROWS } from 'src/engine/workspace-manager/standard-objects-prefill-data/utils/prefill-companies.util';

describe('prefillCompanies', () => {
  it('should seed domain names in the shape a domain-typed links field stores', () => {
    const notCanonical = PREFILL_COMPANY_ROWS.map(
      ({ domainNamePrimaryLinkUrl }) => domainNamePrimaryLinkUrl,
    ).filter((domainName) => normalizeDomain(domainName) !== domainName);

    expect(notCanonical).toEqual([]);
  });
});
