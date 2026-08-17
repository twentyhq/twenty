import { getDomainNamesFromCompany } from 'src/modules/contact-creation-manager/utils/get-domain-names-from-company.util';

describe('getDomainNamesFromCompany', () => {
  it('should return the primary domain and every secondary domain', () => {
    expect(
      getDomainNamesFromCompany({
        primaryLinkLabel: '',
        primaryLinkUrl: 'https://www.twenty.com',
        secondaryLinks: [
          { url: 'https://twenty-crm.com/about', label: '' },
          { url: 'crm.dev', label: '' },
        ],
      }),
    ).toEqual(['twenty.com', 'twenty-crm.com', 'crm.dev']);
  });

  it('should lowercase domains so they match the domain of an email handle', () => {
    expect(
      getDomainNamesFromCompany({
        primaryLinkLabel: '',
        primaryLinkUrl: 'https://Twenty.COM',
        secondaryLinks: [{ url: 'Twenty-CRM.com', label: '' }],
      }),
    ).toEqual(['twenty.com', 'twenty-crm.com']);
  });

  it('should ignore links without url', () => {
    expect(
      getDomainNamesFromCompany({
        primaryLinkLabel: '',
        primaryLinkUrl: '',
        secondaryLinks: [{ url: '', label: 'Old domain' }],
      }),
    ).toEqual([]);
  });

  it('should return an empty list when the company has no domain name', () => {
    expect(getDomainNamesFromCompany(null)).toEqual([]);
  });
});
