const SCHEMES = ['', 'https://', 'http://'];
const SUBDOMAINS = ['', 'www.'];
const TRAILING_SLASHES = ['', '/'];

export const buildDomainNameUrlVariants = (domainName: string): string[] =>
  SCHEMES.flatMap((scheme) =>
    SUBDOMAINS.flatMap((subdomain) =>
      TRAILING_SLASHES.map(
        (trailingSlash) => `${scheme}${subdomain}${domainName}${trailingSlash}`,
      ),
    ),
  );
