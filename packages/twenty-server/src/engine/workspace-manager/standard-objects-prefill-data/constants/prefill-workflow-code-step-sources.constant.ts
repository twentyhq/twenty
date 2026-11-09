export const EXTRACT_DOMAIN_CODE_STEP_SOURCE = `const psl = require('psl');

export const main = async (params) => {
  const email =
    typeof params?.email === 'string' ? params.email.trim().toLowerCase() : '';
  const host = email.split('@')[1] ?? '';
  const domain = host ? (psl.get(host) ?? host) : '';

  return {
    url: domain ? \`https://\${domain}\` : '',
    domain,
  };
};`;

export const IS_PERSONAL_EMAIL_CODE_STEP_SOURCE = `const psl = require('psl');

const PERSONAL_EMAIL_DOMAINS = new Set([
  'aol.com',
  'att.net',
  'btinternet.com',
  'comcast.net',
  'fastmail.com',
  'free.fr',
  'gmx.com',
  'gmx.de',
  'googlemail.com',
  'hotmail.com',
  'hotmail.fr',
  'icloud.com',
  'laposte.net',
  'live.com',
  'mac.com',
  'mail.com',
  'me.com',
  'msn.com',
  'orange.fr',
  'outlook.com',
  'outlook.fr',
  'pm.me',
  'proton.me',
  'protonmail.com',
  'sfr.fr',
  'verizon.net',
  'wanadoo.fr',
  'yahoo.co.jp',
  'yahoo.co.uk',
  'yahoo.com',
  'yandex.com',
  'yandex.ru',
  'zoho.com',
  'gmail.com',
]);

export const main = async (params) => {
  const email =
    typeof params?.primaryEmail === 'string'
      ? params.primaryEmail.trim().toLowerCase()
      : '';

  if (!email || !email.includes('@')) {
    return { isPersonal: true };
  }

  const host = email.split('@')[1] ?? '';
  const registrableDomain = host ? (psl.get(host) ?? '') : '';

  return {
    isPersonal:
      !registrableDomain ||
      PERSONAL_EMAIL_DOMAINS.has(host) ||
      PERSONAL_EMAIL_DOMAINS.has(registrableDomain),
  };
};`;

export const FIND_MATCHING_COMPANY_BY_DOMAIN_CODE_STEP_SOURCE = `const psl = require('psl');

const normalizeHost = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\\/\\//, '')
    .replace(/^www\\./, '')
    .split('/')[0]
    .split('?')[0]
    .split('#')[0]
    .split(':')[0];
};

const getRegistrableDomain = (value) => {
  const host = normalizeHost(value);

  if (!host) {
    return '';
  }

  return psl.get(host) ?? host;
};

export const main = async (params) => {
  const domain = getRegistrableDomain(params?.domain);
  const companies = Array.isArray(params?.companies) ? params.companies : [];

  const matchingCompany = companies.find((company) => {
    const companyDomain = getRegistrableDomain(
      company?.domainName?.primaryLinkUrl,
    );

    return companyDomain !== '' && companyDomain === domain;
  });

  const companyId =
    typeof matchingCompany?.id === 'string' ? matchingCompany.id : '';

  return {
    companyId,
    hasMatch: companyId !== '',
  };
};`;
