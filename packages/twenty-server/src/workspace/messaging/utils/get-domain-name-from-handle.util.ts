import { fromUrl, parseDomain, ParseResultType } from 'parse-domain';

import { capitalize } from 'src/utils/capitalize';

export function getDomainNameFromHandle(handle: string): string {
  const wholeDomain = handle.split('@')?.[1];

  const parseResult = parseDomain(fromUrl(wholeDomain));

  if (parseResult.type === ParseResultType.Listed) {
    const { domain } = parseResult;

    return domain || '';
  } else {
    return '';
  }
}

export function getCompanyNameAndDomainNameFromHandle(handle: string) {
  const wholeDomain = handle.split('@')?.[1];

  const parseResult = parseDomain(fromUrl(wholeDomain));

  if (parseResult.type === ParseResultType.Listed) {
    const { domain, topLevelDomains } = parseResult;

    return {
      domainName: `${domain}.${topLevelDomains.join('.')}`,
      companyName: domain ? capitalize(domain) : '',
    };
  } else {
    return { domain: '', companyName: '' };
  }
}
